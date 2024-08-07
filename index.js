const { Client, GatewayIntentBits, Collection, REST } = require('discord.js');
const { Player } = require('discord-player');
const { Routes } = require('discord-api-types/v9');
const { disconnectBot } = require('./services/actionsService');
const fs = require('fs');
const path = require('path');
const { connect, close } = require('./infra/mongodb/mongodb');
const { serverRepository } = require('./repository/server.repository');
 
require('dotenv/config');

const CHANNEL_NAME = 'memelander';
const CHANNEL_IDS = [];
const COMMANDS = [];
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

async function main() {
  await connect();
}

function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
    ]
  });

  client.commands = new Collection();

  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command || !command?.body) continue;
  
    const body = command.body()

    if (!body) continue;

    console.log(`Command ${body.name} loaded!`);

    client.commands.set(body.name, command);
    COMMANDS.push(body.toJSON());
  }

  client.player = new Player(client, {
    ytdlOptions: {
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
    },
  });

  return client;
}

async function registerCommands(client) {
  let guildIDS = [];

  guildIDS = client.guilds.cache.map(guild => guild.id);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  for (guildID of guildIDS) {
    if (!guildID) continue;

    const guild = client.guilds.cache.get(guildID);
    const channel = guild.channels.cache.find(ch => ch.name === CHANNEL_NAME);
    await serverRepository.upsert({ serverId: guildID, name: guild.name });

    if (channel) {
      CHANNEL_IDS.push(channel.id);
    }

    try {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: COMMANDS });
      console.log(`Successfully registered application commands globally mode: (${process.env.NODE_ENV}) -> ${guildID}`);
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  }
}

const client = createClient();

client.on('ready', async () => {
  await registerCommands(client);
  console.log(`Bot is ready!`);
});

client.on('messageCreate', async (message) => {
  if (message.content === 'ping') {
    message.reply('pong');
  }

  for (const [key] of client.commands.entries()) {
    const command = client.commands.get(key);

    if (message && command?.messages) {
      await command.messages({ message });
    }
  };
});

client.on('interactionCreate', async interaction => {
  try {
    if (!CHANNEL_IDS.includes(interaction.channelId)) {
      await interaction.reply({ content: 'Apenas envie meme no canal #memelander!', ephemeral: true });
      return;
    }
  
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
    
      try {
        await command.execute({ interaction });
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
  
      return;
    }

    for (const [key] of client.commands.entries()) {
      const command = client.commands.get(key);

      if (interaction && command?.interaction) {
        await command.interaction({ interaction });
      }
    };
  } catch (error) {
    console.log('Error on interactionCreate:', error);
  }
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const voiceChannel = oldState.channel || newState.channel;

  if (voiceChannel && voiceChannel.members.size === 1 && voiceChannel.members.has(client.user.id)) {
    disconnectBot(voiceChannel);
  }
});

client.login(process.env.TOKEN);

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing MongoDB connection...');
  await close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Closing MongoDB connection...');
  await close();
  process.exit(0);
});

main();
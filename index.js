const { Client, GatewayIntentBits, Collection, REST } = require('discord.js');
const { Player } = require('discord-player');
const { Routes } = require('discord-api-types/v9');
const { disconnectBot } = require('./commands/play-options');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

const CHANNEL_NAME = 'memelander';
const CHANNEL_IDS = [];
const COMMANDS = [];
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

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

  if (process.env.NODE_ENV !== 'development') {
    guildIDS = client.guilds.cache.map(guild => {
      if (DEV_GUILD_ID === guild.id) return;
      return guild.id;
    });
  } else {
    guildIDS = [DEV_GUILD_ID];
  }

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  for (guildID of guildIDS) {
    if (!guildID) continue;

    const guild = client.guilds.cache.get(guildID);
    const channel = guild.channels.cache.find(ch => ch.name === CHANNEL_NAME);

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

client.on('messageCreate', (message) => {
  if (message.content === 'ping') {
    message.reply('pong');
  }
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
  
    // TODO: review waht better to do .
    // if (interaction.message.interaction.commandName === 'play' && interaction.isButton()) {
    //   await interactionPlay({ interaction });
    // }

    for (const [key] of client.commands.entries()) {
      const command = client.commands.get(key);

      if (interaction && command?.interaction) {
        await command.interaction({ interaction });
      }
    };
    // END TODO
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
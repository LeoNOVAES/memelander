const { Client, GatewayIntentBits, Collection, REST } = require('discord.js');
const { Player } = require('discord-player');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
require('dotenv/config');

const CHANNEL_NAME = 'memelander';
const CHANNEL_IDS = [];
const COMMANDS = [];

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
  // const guildIDS = client.guilds.cache.map(guild => guild.id);
  const guildIDS = ['758496260763418666'];
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  for (guildID of guildIDS) {
    const guild = client.guilds.cache.get(guildID);
    const channel = guild.channels.cache.find(ch => ch.name === CHANNEL_NAME);

    if (channel) {
      CHANNEL_IDS.push(channel.id);
    }

    try {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: COMMANDS });
      console.log(`Successfully registered application commands globally -> ${guildID}`);
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
  if (!CHANNEL_IDS.includes(interaction.channelId)) {
    await interaction.reply({ content: 'Apenas envie meme no canal #memelander!', ephemeral: true });
    return;
  }

  for (const [key, value] of client.commands.entries()) {
    const command = client.commands.get(key);
    await command.interaction({ interaction });
  };
});

client.login(process.env.TOKEN);
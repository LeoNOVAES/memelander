const { Client, GatewayIntentBits, Collection, REST } = require('discord.js');
const { Player, createAudioPlayer } = require('discord-player');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
require('dotenv/config');

const CHANNEL_NAME = 'memelander';
let CHANNEL_IDS = [''];

async function playMeme(url, interaction) {
  if (!interaction || !interaction?.member || !interaction?.voice?.channel) return;

  const connection = joinVoiceChannel({
    channelId: interaction?.member?.voice?.channel?.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });

  const player = createAudioPlayer();
  const song = createAudioResource(url);
  player.play(song);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy();
  });
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ]
});

const commands = [];

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (!command.data) {
    continue;
  }

  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

client.player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
});

client.on('ready', async () => {
  const guildIDS = client.guilds.cache.map(guild => guild.id);
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  for (guildID of guildIDS) {
    const guild = client.guilds.cache.get(guildID);
    const channel = guild.channels.cache.find(ch => ch.name === CHANNEL_NAME);

    if (channel) {
      CHANNEL_IDS.push(channel.id);
    }
    
    try {
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
      console.log('Successfully registered application commands globally.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
  }

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
  
  
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
  
    if (!command) return;
  
    try {
      await command.execute({ client, interaction });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }

    return;
  }

  if (interaction.isButton) {
    switch (interaction.customId) {
      case 'grito_gay':
          await interaction.reply('grito_gay clicked!');
          await playMeme('https://www.myinstants.com/media/sounds/grito-gay.mp3', interaction);
          break;
      case 'fluminense':
          await interaction.reply('Fluminense clicked!');
          await playMeme('https://www.myinstants.com/media/sounds/fluminense.mp3', interaction);
          break;
      case 'fala-baixo-nengue':
          await interaction.reply('fala-baixo-nengue clicked!');
          await playMeme('https://www.myinstants.com/media/sounds/fala-baixo-nengue.mp3', interaction);
          break;
      case 'meu-cu-no-seu-pal':
        await interaction.reply('lucas-meu-cu-no-seu-pal clicked!');
        await playMeme('https://www.myinstants.com/media/sounds/c_1.mp3', interaction);
        break;
      case 'gado-miseravel-nando-moura':
        await interaction.reply('gado-miseravel-nando-moura clicked!');
        await playMeme('https://www.myinstants.com/media/sounds/gado-miseravel-nando-moura.mp3', interaction);
        break;
        case 'vegeta-o-miseravel-e-um-miseravel-online-audio-converter':
          await interaction.reply('vegeta-o-miseravel-e-um-miseravel-online-audio-converter clicked!');
          await playMeme('https://www.myinstants.com/media/sounds/vegeta-o-miseravel-e-um-miseravel-online-audio-converter.mp3', interaction);
          break;
      default:
          await interaction.reply('Unknown button clicked!');
          break;
    }
  }
});

client.login(process.env.TOKEN);
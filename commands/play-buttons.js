const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { createAudioPlayer } = require('discord-player');

async function playMeme(url, interaction) {
  if (!interaction || !interaction?.member || !interaction?.member?.voice?.channel) return;

  const connection = joinVoiceChannel({
    channelId: interaction?.member?.voice?.channel?.id,
    guildId: interaction?.guild?.id,
    adapterCreator: interaction?.guild?.voiceAdapterCreator,
  });

  const player = createAudioPlayer();
  const song = createAudioResource(url);
  player.play(song);
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy();
  });
}

function body() {
  return new SlashCommandBuilder()
    .setName('play')
    .setDescription('play a meme with buttons');
}

async function execute({ interaction }) {
  const { voice } = interaction.member;

  if (!voice.channel) {
    interaction.reply('Voce precisa estar em um canal de VOZ para executar esse comando!');
    return;
  }

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('grito_gay')
        .setLabel('Grito Gay')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('fluminense')
        .setLabel('Fluminense')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('fala-baixo-nengue')
        .setLabel('fala-baixo-nengue')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('meu-cu-no-seu-pal')
        .setLabel('meu-cu-no-seu-pal')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('gado-miseravel-nando-moura')
        .setLabel('gado-miseravel-nando-moura')
        .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('vegeta-o-miseravel-e-um-miseravel-online-audio-converter')
        .setLabel('vegeta-o-miseravel-e-um-miseravel-online-audio-converter')
        .setStyle(ButtonStyle.Success),
    );

  await interaction.reply({ content: 'Todos os audios disponiveis:', components: [row, row2] });
}

async function interaction({interaction}) {
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
}


module.exports = {
  body,
  execute,
  interaction,
}
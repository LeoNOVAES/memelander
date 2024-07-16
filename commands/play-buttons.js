const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { createAudioPlayer } = require('discord-player');
const sounds = require('../sounds/sounds.json');

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
        .setCustomId('vegeta-o-miseravel-e-um-miseravel')
        .setLabel('vegeta-o-miseravel-e-um-miseravel-online-audio-converter')
        .setStyle(ButtonStyle.Success),
    );

  await interaction.reply({ content: 'Todos os audios disponiveis:', components: [row, row2] });
}

async function interaction({interaction}) {
  if (interaction.isButton) {
    const sound = sounds.find(sound => sound.id === interaction.customId);

    if (!sound) {
      await interaction.reply('meme nao encontrado!');
      return;
    }

    await interaction.reply(`${interaction.user.username} clicou em ${sound.name}!`);
    await playMeme(sound.url, interaction);
  }
}

module.exports = {
  body,
  execute,
  interaction,
}
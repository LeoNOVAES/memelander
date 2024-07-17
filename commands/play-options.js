const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { createAudioPlayer } = require('discord-player');
const sounds = require('../sounds/sounds.json');

let rows = [];

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

function buildRows(index = 0) {
  rows = [];

  const colors = [
    { color: ButtonStyle.Primary },
    { color: ButtonStyle.Secondary },
    { color: ButtonStyle.Success },
    { color: ButtonStyle.Danger },
    { color: ButtonStyle.Primary },
  ]

  const action = new ActionRowBuilder();
  let count = 0;
  console.log(`Needs to build ${sounds.length} sounds buttons`);

  for (let i = index; i < sounds.length; i++) {
    if (count === 5) {
      buildRows(i);
      rows.push(action);
      return;
    }

    action.addComponents(new ButtonBuilder()
      .setCustomId(sounds[i].id)
      .setLabel(sounds[i].name)
      .setStyle(colors[count].color));

    count++;

    if (!sounds[i + 1]?.name) {
      rows.push(action);
      continue;
    }
  }
}

async function execute({ interaction }) {
  const { voice } = interaction.member;

  if (!voice.channel) {
    interaction.reply('Voce precisa estar em um canal de VOZ para executar esse comando!');
    return;
  }

  buildRows();
  await interaction.reply({ content: 'Todos os audios disponiveis:', components: [...rows] });
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
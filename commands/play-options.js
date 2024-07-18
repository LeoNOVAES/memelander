const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const { createAudioPlayer } = require('discord-player');
const sounds = require('../sounds/sounds.json');

let rows = [];
let disconnectTimeout;
const TIMEOUT_DISCONNECT = 60 * 60 * 1000; // 1 hour in milliseconds

async function playMeme(url, interaction) {
  if (!interaction || !interaction?.member || !interaction?.member?.voice?.channel) return;

  const voiceChannel = interaction.member.voice.channel;
  const connection = joinChannel(voiceChannel, interaction.guild);

  const player = createAudioPlayer();
  const song = createAudioResource(url);
  player.play(song);
  connection.subscribe(player);

  clearTimeoutBot();
  startDisconnectTimer(voiceChannel);
}

function joinChannel(voiceChannel) {
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  return connection;
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
  if (interaction.isButton && interaction?.message?.interaction.commandName === 'play') {
    clearTimeoutBot();
    const sound = sounds.find(sound => sound.id === interaction.customId);

    if (!sound) {
      await interaction.reply('meme nao encontrado!');
      return;
    }

    await interaction.reply(`${interaction.user.username} clicou em ${sound.name}!`);
    await playMeme(sound.url, interaction);
  }
}

function startDisconnectTimer(voiceChannel) {
  disconnectTimeout = setTimeout(() => {
    disconnectBot(voiceChannel);
  }, TIMEOUT_DISCONNECT);
}

function disconnectBot(voiceChannel) {
  clearTimeoutBot();
  const connection = getVoiceConnection(voiceChannel.guild.id);
  if (connection) {
    connection.destroy();
    console.log('Bot has left the voice channel due to inactivity.');
  }
}

function clearTimeoutBot() {
  clearTimeout(disconnectTimeout);
}

module.exports = {
  body,
  execute,
  interaction,
  disconnectBot,
}
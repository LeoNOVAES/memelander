const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { joinVoiceChannel, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const { createAudioPlayer } = require('discord-player');
const sounds = require('../sounds/sounds.json');

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

function createRowGroup(start, end) {
  console.log('creating group row');
  const colors = [
    { color: ButtonStyle.Primary },
    { color: ButtonStyle.Secondary },
    { color: ButtonStyle.Success },
    { color: ButtonStyle.Danger },
    { color: ButtonStyle.Primary },
    { color: ButtonStyle.Success },
  ]

  const rows = [];
  let action = new ActionRowBuilder();

  for (let i = start; i <= end; i++) {
    const actionsLength = action.components.length;

    if (actionsLength === 5 && sounds[i + 1]?.name) {
      rows.push(action);
      action = new ActionRowBuilder();
    }

    if (!sounds[i]) break;
    const emoji = sounds[i]?.emoji || '🤣';

    action.addComponents(new ButtonBuilder()
        .setCustomId(sounds[i].id)
        .setLabel(`${emoji} ${sounds[i].name}`)
        .setStyle(colors[actionsLength]?.color));

    if (!sounds[i + 1]?.name && actionsLength < 5) {
      rows.push(action);
      break;
    }
  }

  return rows;
}

async function execute({ interaction }) {
  const { voice } = interaction.member;

  if (!voice.channel) {
    interaction.reply({ content: 'Voce precisa estar em um canal de voz para usar esse comando!', ephemeral: true });
    return;
  }

  await interaction.reply({ content: 'Carregando os memes...', ephemeral: true });
  
  const totalRows = Math.ceil(sounds.length/25);

  for (let i = 0; i < totalRows; i++) {
    const start = i * 25;
    const end = start + 25;
    const rows = createRowGroup(start, end, ButtonStyle.Primary);
 
    await interaction.followUp({ content: `Pagina ${i+1} de memes disponiveis:`, components: rows });
  }
}

async function interaction({interaction}) {
  const from = interaction?.customId.split('_')[0];

  if (interaction.isButton && from === 'MEME') {
    clearTimeoutBot();
    const sound = sounds.find(sound => sound.id === interaction.customId);

    if (!sound) {
      await interaction.reply({ content: 'meme nao encontrado!', ephemeral: true });
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
const { getVoiceConnection, joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');

const TIMEOUT_DISCONNECT = 60 * 60 * 1000; // 1 hour in milliseconds
let disconnectTimeout;

const disconnectBot = (voiceChannel)  => {
  clearTimeoutBot();
  const connection = getVoiceConnection(voiceChannel.guild.id);
  if (connection) {
    connection.destroy();
    console.log('Bot has left the voice channel due to inactivity.');
  }
}

const startDisconnectTimer = (voiceChannel) => {
  disconnectTimeout = setTimeout(() => {
    disconnectBot(voiceChannel);
  }, TIMEOUT_DISCONNECT);
}

const clearTimeoutBot = () => {
  clearTimeout(disconnectTimeout);
}

const joinChannel = (voiceChannel) => {
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  return connection;
}

const playMeme = async (url, interaction) => {
  if (!interaction || !interaction?.member || !interaction?.member?.voice?.channel) return;

  const voiceChannel = interaction.member.voice.channel;
  const connection = joinChannel(voiceChannel, interaction.guild);

  const player = createAudioPlayer();
  const song = createAudioResource(url, { inlineVolume: true });
  song?.volume?.setVolume(0.4);

  player.play(song);
  connection.subscribe(player);

  clearTimeoutBot();
  startDisconnectTimer(voiceChannel);
}

module.exports = {
  startDisconnectTimer,
  disconnectBot,
  clearTimeoutBot,
  playMeme,
}
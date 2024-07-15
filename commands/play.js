const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus } = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playmeme')
    .setDescription('play a meme'),
    execute: async ({ client, interaction }) => {
      const { voice } = interaction.member;
      console.log(voice.channel);
      if (!voice.channel) {
        interaction.reply('Voce precisa estar em um canal de VOZ para executar esse comando!');
        return;
      }

      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      const song = createAudioResource('https://www.myinstants.com/media/sounds/grito-gay.mp3');
      player.play(song);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

      await interaction.reply('Joined the voice channel and playing audio!');
    }
}
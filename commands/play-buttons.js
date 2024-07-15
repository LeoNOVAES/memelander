const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus,MessageActionRow,  MessageButton } = require("@discordjs/voice");
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('play a meme with buttons'),
    execute: async ({ client, interaction }) => {
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
}
const { SlashCommandBuilder, InteractionType, ButtonStyle, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { textToSpeech, voices, speechToSpeech } = require('../infra/eleven-labs/voiceService');
const { googleStorage } = require('../repository/storage.repository');
const { memeRepository } = require('../repository/memes.repository');
const { serverRepository } = require('../repository/server.repository');
const queryBuilder = require('../infra/mongodb/mongo-query-builder');

let selectedVoice = null;

function body() {
  return new SlashCommandBuilder()
    .setName('criar')
    .setDescription('criar um meme')
    .addStringOption(option => 
      option.setName('voz')
        .setDescription('voz a ser usada')
        .setAutocomplete(true)
        .setRequired(true)
    )
}

async function execute({ interaction }) {
  if (interaction.isCommand() && interaction.commandName === 'criar') {
    const voiceId = interaction.options.getString('voz');    
    const voice = voices.find(v => v.id === voiceId);

    console.log('Chosed voice', voice);
    selectedVoice = voice;

    const modal = new ModalBuilder()
      .setCustomId('create_meme')
      .setTitle(`Crie um novo meme com a voz do ${voice.name}`);

    const nameInput = new TextInputBuilder()
      .setCustomId('name_input')
      .setLabel('Nome do meme')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const textInput = new TextInputBuilder()
      .setCustomId('text_input')
      .setLabel('Invente um meme (60 caracteres)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const volumeInput = new TextInputBuilder()
      .setCustomId('volume_input')
      .setLabel('Volume (apenas numeros de escala 0 a 9)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setMinLength(1)
      .setMaxLength(1)
      .setValue('4');

    const nameRow = new ActionRowBuilder().addComponents(nameInput);
    modal.addComponents(nameRow);

    const textRow = new ActionRowBuilder().addComponents(textInput);
    modal.addComponents(textRow);

    const volumeRow = new ActionRowBuilder().addComponents(volumeInput);
    modal.addComponents(volumeRow);

    await interaction.showModal(modal);
    return;
  }
}

async function interaction({ interaction }) {
  if (interaction.type === InteractionType.ApplicationCommandAutocomplete && interaction.commandName === 'criar') {
    const focusedValue = interaction.options.getFocused();
    const filtered = voices.filter(v => v.name.toLowerCase().includes(focusedValue.toLowerCase()));
    const sliced = filtered.slice(0, 24);

    await interaction.respond(
      sliced.map(v => ({ name: `${v.name}` , value: v.id }))
    );
  }

  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'create_meme') {
    const server = await serverRepository.findById(interaction.guild.id);
    const regex = /[-\s]/g;
    const name = `(${selectedVoice.name}) ${interaction.fields.getTextInputValue('name_input')}`;
    const text = interaction.fields.getTextInputValue('text_input');

    if (text.length > 60) {
      await interaction.reply({ content: 'Texto muito grande, tente algo menor', ephemeral: true });
      return;
    }

    const volume = interaction.fields.getTextInputValue('volume_input');
    const customId = 'MEME_' + name.trim().replace(regex, '_').toUpperCase();
    const buffer = await textToSpeech(selectedVoice.id, text);

    const query = queryBuilder.or(
      { name },
      { memeId: customId }
    );

    const exists = await memeRepository.findAll(query);

    if (exists.length) {
      console.log('Meme already exists');
      await interaction.reply({ content: `Tente criar um meme com nome diferente`, ephemeral: true });
      return;
    }

    const result = await googleStorage.add(null, customId, buffer);
    console.log('Result:', result);
   
    if (!result.success) {
      await interaction.reply({ content: 'Error desconhecido ao criar meme', ephemeral: true });
      return;
    }

    const meme = {
      memeId: customId,
      name,
      url: result.content,
      creator: interaction.user.id,
      volume: parseVolume(volume),
    }

    await memeRepository.store(meme);
    await memeRepository.addServerToMeme(customId, server._id);
    await interaction.reply({ content: `${interaction.user.username} criou o meme ${name}`, ephemeral: true });
  }
}

function parseVolume(volume) {
  const integer = Number(volume) + 1;
  return integer / 10;
}

module.exports = {
  body,
  execute,
  interaction,
}
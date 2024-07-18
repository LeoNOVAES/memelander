const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, InteractionType } = require('discord.js');
const sounds = require('../sounds/sounds.json');

function body() {
  return new SlashCommandBuilder()
    .setName('add')
    .setDescription('add an meme');
}

async function execute({ interaction }) {
  if (interaction.isCommand() && interaction.commandName === 'add') {
    await openFormModal(interaction);
    return;
  }
}

async function interaction({ interaction }) {
  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'add_modal') {
    const name = interaction.fields.getTextInputValue('name_input');
    const url = interaction.fields.getTextInputValue('url_input');
    const result = addSound(name, url);

    await interaction.reply({ content: result.message, ephemeral: true });
    return;
  }
}

function addSound(name, url) {
  console.log('Adding sound:', name, url);
  const regex = /[-\s]/g;
  const customId = name.trim().replace(regex, '_').toUpperCase() ;
  const exists = sounds.find(sound => sound.url === url || sound.name === name || sound.id === customId);

  if (exists) {
    console.log('Sound already exists');
    return { success: false, message: 'Som ja existe tente outro som!' };
  }

  const sound = {
    id: customId,
    name,
    url,
  };

  sounds.push(sound);
  return { success: true, message: 'Som adicionado com sucesso!' };
}

async function openFormModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('add_modal')
    .setTitle('Adicione um novo meme');
  const nameInput = new TextInputBuilder()
    .setCustomId('name_input')
    .setLabel('Nome')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);
  const urlInput = new TextInputBuilder()
    .setCustomId('url_input')
    .setLabel('URL')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);
  const nameRow = new ActionRowBuilder().addComponents(nameInput);
  const urlRow = new ActionRowBuilder().addComponents(urlInput);
  modal.addComponents(nameRow, urlRow);
  await interaction.showModal(modal);
}

module.exports = {
  body,
  execute,
  interaction,
}
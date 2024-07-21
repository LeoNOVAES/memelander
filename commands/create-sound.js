const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, InteractionType, ButtonStyle, ButtonBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const sounds = require('../sounds/sounds.json');
const { getInstantSound } = require('../scrapers/my-instants');
const path = require('path');
const fs = require('fs');

function body() {
  return new SlashCommandBuilder()
    .setName('add')
    .setDescription('add an meme');
}

async function execute({ interaction }) {
  if (interaction.isCommand() && interaction.commandName === 'add') {
    const action = new ActionRowBuilder();

    action.addComponents(new ButtonBuilder()
      .setCustomId('myinstants')
      .setLabel('Criar som pelo myinstants')
      .setStyle(ButtonStyle.Primary));

    await interaction.reply({ content: 'Escolha alguma dessas formas de criacao de audio: ', components: [action], ephemeral: true });
  }
}

async function interaction({ interaction }) {
  if (interaction.isButton && interaction.customId === 'myinstants' && interaction?.message?.interaction.commandName === 'add') {
    await openInstantsFormModal(interaction);
    return;
  }

  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'add_instances_modal') {
    await interaction.deferReply();
    const sound = await getInstantSound(interaction.fields.getTextInputValue('url_input'));

    // const emoji = interaction?.fields?.getTextInputValue('emoji_input');
    
    if (sound?.error) {
      await interaction.editReply({ content: sound.error, ephemeral: true });
      return;
    }

    const result = await addSound(sound.name, sound.url);
    console.log('[INFO] added sound from My Instants - ', result);

    if (!result.success) {
      await interaction.editReply({ content: result.content, ephemeral: true });
      return;
    }

    await interaction.editReply({ content: `${interaction.user.username} adicionou o meme ${result.content}`  });
    return;
  }

  // if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'add_modal') {
  //   const name = interaction.fields.getTextInputValue('name_input');
  //   const url = interaction.fields.getTextInputValue('url_input');
  //   const result = await addSound(name, url);
  //   await interaction.reply({ content: result || '', ephemeral: true });
  //   return;
  // }
}

async function addSound(name, url, emoji = '🤣') {
  console.log('Adding sound:', name, url);
  const regex = /[-\s]/g;
  const customId = 'MEME_' + name.trim().replace(regex, '_').toUpperCase() ;
  const exists = sounds.find(sound => sound.url === url || sound.name === name || sound.id === customId);

  if (exists) {
    console.log('Sound already exists');
    return { success: false , content: `${name} ja existe tente outro meme!` };
  }

  const sound = {
    id: customId,
    name,
    url,
    emoji,
  };

  sounds.push(sound);
  await rewriteJsonFileAsync(sounds);
  return { success: true , content: name };
}

async function openUrlFormModal(interaction) {
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

async function openInstantsFormModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('add_instances_modal')
    .setTitle('Adicione um novo meme pelo My Instants');
  const urlInput = new TextInputBuilder()
    .setCustomId('url_input')
    .setLabel('URL')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  // const emojiInput = new TextInputBuilder()
  //   .setCustomId('emoji_input')
  //   .setLabel('emoji')
  //   .setStyle(TextInputStyle.Short)
  //   .setRequired(false);

  // const selectEmojiInput = new StringSelectMenuOptionBuilder()
  // .setCustomId('starter')
  // .setPlaceholder('Make a selection!')
  // .addOptions(
  //   new StringSelectMenuOptionBuilder()
  //     .setLabel('Bulbasaur')
  //     .setDescription('The dual-type Grass/Poison Seed Pokémon.')
  //     .setValue('bulbasaur'));

  const urlRow = new ActionRowBuilder().addComponents(urlInput);
  // const emojiRow = new ActionRowBuilder().addComponents(selectEmojiInput);

  modal.addComponents(urlRow);
  // modal.addComponents(emojiRow);

  await interaction.showModal(modal);
}

function rewriteJsonFileAsync(data) {
  const soundsPath = path.join(__dirname, '../sounds/sounds.json');

  return new Promise((resolve, reject) => {
    fs.writeFile(soundsPath, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
        reject(`Error writing file to disk: ${err}`);
      } else {
        resolve('JSON data is saved.');
      }
    });
  });
}

module.exports = {
  body,
  execute,
  interaction,
}
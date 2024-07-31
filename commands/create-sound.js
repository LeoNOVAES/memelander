const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, InteractionType, ButtonStyle, ButtonBuilder } = require('discord.js');
const { getInstantSound } = require('../repository/my-instants.repository');
const { memeRepository } = require('../repository/memes.repository');
const { serverRepository } = require('../repository/server.repository');
const { googleStorage } = require('../repository/storage.repository');
const { emojiRegex } = require('../utils/regex-util');
const queryBuilder = require('../infra/mongodb/mongo-query-builder');
const MemeButtonsComponent = require('./shared-components/meme-buttons');

let memeState = {
  memeId: '',
  name: '',
  emoji: '',
  url: '',
  creator: '',
  volume: 0.4,
}

function resetMemeState() {
  memeState = {
    memeId: '',
    name: '',
    emoji: '',
    url: '',
    creator: '',
    volume: 0.4,
  }
}

function setMemeState(state) {
  memeState = {
    ...memeState,
    ...state
  }
}

function body() {
  return new SlashCommandBuilder()
    .setName('add')
    .setDescription('add an meme')
    .addStringOption(option =>
      option.setName('emoji')
            .setDescription('The emoji to add!')
            .setRequired(false)
    )
}

async function execute({ interaction }) {
  if (interaction.isCommand() && interaction.commandName === 'add') {
    const action = new ActionRowBuilder();
    resetMemeState();

    if (interaction?.options?.getString('emoji') && !emojiRegex(interaction.options.getString('emoji'))) {
      await interaction.reply({ content: 'Emoji invalido, tente outro emoji!', ephemeral: true });
      return;
    }

    setMemeState({
      ...memeState,
      emoji: interaction.options.getString('emoji') || '🤣',
      creator: interaction.user.id,
    });

    action.addComponents(new ButtonBuilder()
      .setCustomId('myinstants')
      .setEmoji('🚨')
      .setLabel('Criar som pelo myinstants')
      .setStyle(ButtonStyle.Primary));

    action.addComponents(new ButtonBuilder()
      .setCustomId('file')
      .setEmoji('◀️')
      .setLabel('Anexar MP3')
      .setStyle(ButtonStyle.Success));

    action.addComponents(new ButtonBuilder()
      .setCustomId('existing')
      .setEmoji('🖋️')
      .setLabel('Escolher um meme existente')
      .setStyle(ButtonStyle.Danger));

    await interaction.reply(
      { 
        content: 'Escolha alguma dessas formas de criacao de audio: ', 
        components: [action],
        ephemeral: true
      });
  }
}

async function interaction({ interaction }) {
  const server = await serverRepository.findById(interaction.guild.id);

  if (interaction.isButton && interaction.customId === 'myinstants' && interaction?.message?.interaction?.commandName === 'add') {
    await openInstantsFormModal(interaction);
    return;
  }

  if (interaction.isButton && interaction.customId === 'file' && interaction?.message?.interaction?.commandName === 'add') {
    console.log('File button clicked');
    openFileFormModal(interaction);
    return;
  };

  if (interaction.isButton && interaction.customId === 'existing' && interaction?.message?.interaction?.commandName === 'add') {
    console.log('existing button clicked');
    const query = {
      servers: queryBuilder.notIn(server._id),
    };

    const total = await memeRepository.count(query); 
    const totalPages = Math.ceil(total / 25);

    await interaction.reply({ content: 'carregando memes...', ephemeral: true });
    await MemeButtonsComponent(totalPages, interaction, query);
    return;
  };

  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'add_file_modal') {
    console.log('File form submitted');
    await interaction.reply({ 
      content: `Anexe algum arquivo MP3 ate 30 segundos de duracao e o maximo 3mb`, 
      ephemeral: true 
    });

    await collectionUploadFile(interaction);
    return;
  }

  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'add_instances_modal') {
    const regex = /[-\s]/g;
    await interaction.deferReply();
    const volume = parseVolume(interaction.fields.getTextInputValue('volume_input'));
    const sound = await getInstantSound(interaction.fields.getTextInputValue('url_input'));
    const server = await serverRepository.findById(interaction.guild.id);

    if (!server) {
      await interaction.editReply({ content: 'Server not found', ephemeral: true });
      return;
    }

    if (sound?.error) {
      await interaction.editReply({ content: sound.error, ephemeral: true });
      return;
    }

    const customId = 'MEME_' + sound.name.trim().replace(regex, '_').toUpperCase();
    
    const query = queryBuilder.or(
      { url: sound.url }, 
      { name: sound.name }, 
      { memeId: customId },
    );

    const exists = await memeRepository.findAll(query);

    if (exists.length) {
      console.log('Sound already exists');
      await memeRepository.addServerToMeme(customId, server._id);
      await interaction.editReply({ content: `${sound.name} adicionado ao servidor!`, ephemeral: true });
      return;
    }

    setMemeState({
      memeId: customId,
      name: sound.name,
      url: sound.url,
      creator: interaction.user.id,
      volume,
    })

    const result = await addSound(memeState);
    console.log('[INFO] added sound from My Instants - ', result);

    await memeRepository.addServerToMeme(customId, server._id);

    if (!result.success) {
      await interaction.editReply({ content: result.content, ephemeral: true });
      return;
    }

    await interaction.editReply({ content: `${interaction.user.username} adicionou o meme ${result.content}`  });
    return;
  }

  if (interaction.type === InteractionType.MessageComponent) {
    const customIdSplitted = interaction.customId.split('-');
    const from = customIdSplitted[0] || '';
    const customIdFormatted = customIdSplitted[1];

    if (!interaction.isButton || from !== 'ADD') return;

    const { name } = await addExistsMeme(server, customIdFormatted);
    await interaction.reply({ content: `${interaction.user.username} adicionou o meme ${name} ao servidor!`  });
    return;
  }
}

async function addSound(memeState) {
  console.log('Adding sound:', memeState.name, memeState.url, memeState.emoji, memeState.memeId);
  const { _id } = await memeRepository.store(memeState);
  resetMemeState();
  return { success: true , content: memeState.name, soundId: _id };
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

  const volumeInput = new TextInputBuilder()
    .setCustomId('volume_input')
    .setLabel('Volume (apenas numeros de escala 0 a 9)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMinLength(1)
    .setMaxLength(1)
    .setValue('4');

  const urlRow = new ActionRowBuilder().addComponents(urlInput);
  modal.addComponents(urlRow);

  const volumeRow = new ActionRowBuilder().addComponents(volumeInput);
  modal.addComponents(volumeRow);

  await interaction.showModal(modal);
}

async function openFileFormModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId('add_file_modal')
    .setTitle('Adicione um novo meme');
  const urlInput = new TextInputBuilder()
    .setCustomId('name_input')
    .setLabel('Nome')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const urlRow = new ActionRowBuilder().addComponents(urlInput);
  modal.addComponents(urlRow);
  
  const volumeInput = new TextInputBuilder()
    .setCustomId('volume_input_file')
    .setLabel('Volume (apenas numeros de escala 0 a 9)')
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMinLength(1)
    .setMaxLength(1)
    .setValue('4');

  const volumeRow = new ActionRowBuilder().addComponents(volumeInput);
  modal.addComponents(volumeRow);

  await interaction.showModal(modal);
}

async function collectionUploadFile(interaction) {
  const filter = m => m.author.id === interaction.user.id && m.attachments.size > 0;
  const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
  const server = await serverRepository.findById(interaction.guild.id);

  if (!server) {
    message.reply({ content: 'Server not found', ephemeral: true });
    return;
  }

  collector.on('collect', async message => {
    const name = interaction.fields.getTextInputValue('name_input')
    const volume = interaction.fields.getTextInputValue('volume_input_file')

    const attachment = message.attachments.first();

    if (!name) {
      await message.reply('Por favor escolha um nome valido.');
      await message.delete();
      return
    };

    if (!attachment.name.endsWith('.mp3')) {
      await message.reply('Por favor anexe um MP3 valido.');
      await message.delete();
      return;
    }

    const query = queryBuilder.or(
      { name },
    );

    const exists = await memeRepository.findAll(query);

    if (exists.length) {
      console.log('Meme already exists');
      await interaction.editReply({ content: `${sound.name} adicionado ao servidor!`, ephemeral: true });
      await message.delete();
      return;
    }

    const customId = 'MEME_' + name.trim().replace(/[-\s]/g, '_').toUpperCase();
    const result = await googleStorage.add(attachment.url, customId);

    if (!result.success) {
      await message.reply({ content: result.content, ephemeral: true });
      await message.delete();
      return;
    }

    setMemeState({
      memeId: customId,
      name,
      url: result.content,
      creator: interaction.user.id,
      volume: parseVolume(volume),
    });

    await addSound(memeState);
    
    await memeRepository.addServerToMeme(
      customId,
      server._id,
    );

    console.log('MP3 file attached');
    await message.reply({ content: `${interaction.user.username} adicionou o meme ${name}`});
    await message.delete();
  });

  collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.followUp('Voce nao anexou nenhum arquivo.');
      }
  });
}

async function addExistsMeme(server, customId) {
  console.log('Adding existing meme');
  const sound = await memeRepository.findById(customId);
  await memeRepository.addServerToMeme(customId, server._id);
  return sound;
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
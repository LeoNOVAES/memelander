const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, InteractionType, ButtonStyle, ButtonBuilder } = require('discord.js');
const { getInstantSound } = require('../repository/my-instants.repository');
const { repository } = require('../repository/memes.repository');
const { googleStorage } = require('../repository/storage.repository');
const fetch = require('node-fetch');
const mp3Duration = require('mp3-duration');

const THREE_MB = 3 * 1024 * 1024;
const MAX_DURATION_SEC = 30;

let memeState = {
  memeId: '',
  name: '',
  emoji: '',
  url: '',
}

function resetMemeState() {
  memeState = {
    memeId: '',
    name: '',
    emoji: '',
    url: '',
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

    await interaction.reply(
      { 
        content: 'Escolha alguma dessas formas de criacao de audio: ', 
        components: [action],
        ephemeral: true
      });
  }
}

async function interaction({ interaction }) {
  if (interaction.isButton && interaction.customId === 'myinstants' && interaction?.message?.interaction?.commandName === 'add') {
    await openInstantsFormModal(interaction);
    return;
  }

  if (interaction.isButton && interaction.customId === 'file' && interaction?.message?.interaction?.commandName === 'add') {
    console.log('File button clicked');
    await interaction.reply({ 
      content: `Anexe algum arquivo MP3 ate ${MAX_DURATION_SEC} segundos de duracao e o maximo 3mb`, 
      ephemeral: true 
    });

    const filter = m => m.author.id === interaction.user.id && m.attachments.size > 0;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

    collector.on('collect', async message => {
      const attachment = message.attachments.first();

      if (!attachment.name.endsWith('.mp3')) {
        await message.reply('Por favor anexe um MP3 valido.');
        await message.delete();
        return;
      }

      const { buffer, filename } = await getBufferAndFileName(attachment.url);

      if (buffer.length > THREE_MB) {
        console.log('File too big');
        await message.reply(`O arquivo deve ser menor que 3mb.`);
        await message.delete();
        return;
      }

      const duration = await mp3Duration(buffer);
      console.log(`Duration: ${duration} seconds`);

      if (duration > MAX_DURATION_SEC) {
        await message.reply({ content: `O audio deve ser menor que ${MAX_DURATION_SEC} segundos.`, ephemeral: true });
        await message.delete();
        return;
      }

      const query = repository.or(
        { name: filename },
      );

      const exists = await repository.findAll(query);
  
      if (exists.length) {
        console.log('Sound already exists');
        await message.reply({ content: `${filename} ja existe tente outro meme!`, ephemeral: true });
        await message.delete();
        return;
      }

      const url = await googleStorage.add(buffer, filename);
      const customId = 'MEME_' + filename.trim().replace(/[-\s]/g, '_').toUpperCase();

      setMemeState({
        memeId: customId,
        name: filename,
        url,
      });

      await addSound(memeState);
      console.log('MP3 file attached');
      await message.reply({ content: `${interaction.user.username} adicionou o meme ${filename}`});
      await message.delete();
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            interaction.followUp('Voce nao anexou nenhum arquivo.');
        }
    });
  }

  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'add_instances_modal') {
    const regex = /[-\s]/g;
    await interaction.deferReply();
    const sound = await getInstantSound(interaction.fields.getTextInputValue('url_input'));

    if (sound?.error) {
      await interaction.editReply({ content: sound.error, ephemeral: true });
      return;
    }

    const customId = 'MEME_' + sound.name.trim().replace(regex, '_').toUpperCase();
    
    const query = repository.or(
      { url: sound.url }, 
      { name: sound.name }, 
      { memeId: customId }
    );

    const exists = await repository.findAll(query);

    if (exists.length) {
      console.log('Sound already exists');
      await interaction.editReply({ content: `${sound.name} ja existe tente outro meme!`, ephemeral: true });
      return;
    }

    setMemeState({
      memeId: customId,
      name: sound.name,
      url: sound.url,
    })

    const result = await addSound(memeState);
    console.log('[INFO] added sound from My Instants - ', result);

    if (!result.success) {
      await interaction.editReply({ content: result.content, ephemeral: true });
      return;
    }

    await interaction.editReply({ content: `${interaction.user.username} adicionou o meme ${result.content}`  });
    return;
  }
}

async function addSound(memeState) {
  console.log('Adding sound:', memeState.name, memeState.url, memeState.emoji, memeState.memeId);
  await repository.store(memeState);
  resetMemeState();
  return { success: true , content: memeState.name };
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

  const urlRow = new ActionRowBuilder().addComponents(urlInput);
  modal.addComponents(urlRow);

  await interaction.showModal(modal);
}

function emojiRegex(input) {
  const regexExp = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
  return regexExp.test(input);
}

async function getBufferAndFileName(urlFile) {
  console.log('Fetching file from url:', urlFile );
  const response = await fetch(urlFile);
  if (!response.ok) return;

  const buffer = await response.buffer();
  const disposition = response.headers.get('content-disposition');
  let filename = 'default.mp3';

  if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?(.+?)"?(;|$)/);
      if (match && match[1]) {
          filename = match[1];
      }
  } else {
      filename = path.basename(url);
  }

  if (filename.endsWith('.mp3')) {
    filename = filename.slice(0, -4);
  }

  return { buffer, filename };
}

module.exports = {
  body,
  execute,
  interaction,
}
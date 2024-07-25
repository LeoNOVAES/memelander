const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, InteractionType, ButtonStyle, ButtonBuilder } = require('discord.js');
const { getInstantSound } = require('../repository/my-instants.repository');
const { repository } = require('../repository/memes.repository');

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

    await interaction.reply(
      { 
        content: 'Escolha alguma dessas formas de criacao de audio: ', 
        components: [action],
        ephemeral: true
      });
  }
}

async function interaction({ interaction }) {
  if (interaction.isButton && interaction.customId === 'myinstants' && interaction?.message?.interaction.commandName === 'add') {
    await openInstantsFormModal(interaction);
    return;
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

module.exports = {
  body,
  execute,
  interaction,
}
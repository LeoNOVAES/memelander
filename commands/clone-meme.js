const { SlashCommandBuilder, InteractionType, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { voices, speechToSpeech } = require('../infra/eleven-labs/voiceService');
const { googleStorage } = require('../repository/storage.repository');
const { memeRepository } = require('../repository/memes.repository');
const { serverRepository } = require('../repository/server.repository');
const queryBuilder = require('../infra/mongodb/mongo-query-builder');
const fetch = require('node-fetch');

let selectedVoice = null;

function body() {
  return new SlashCommandBuilder()
    .setName('clone')
    .setDescription('clone um meme')
    .addStringOption(option => 
      option.setName('voz')
        .setDescription('voz a ser usada')
        .setAutocomplete(true)
        .setRequired(true)
    )
}

async function execute({ interaction }) {
  if (interaction.isCommand() && interaction.commandName === 'clone') {
    const voiceId = interaction.options.getString('voz');    
    const voice = voices.find(v => v.id === voiceId);

    console.log('Chosed voice', voice);
    selectedVoice = voice;

    const modal = new ModalBuilder()
      .setCustomId('clone_meme')
      .setTitle(`Clone um novo meme com a voz do ${voice.name}`);

    const nameInput = new TextInputBuilder()
      .setCustomId('name_input')
      .setLabel('Nome do meme')
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

    const volumeRow = new ActionRowBuilder().addComponents(volumeInput);
    modal.addComponents(volumeRow);

    await interaction.showModal(modal);
    return;
  }
}

async function interaction({ interaction }) {
  if (interaction.type === InteractionType.ApplicationCommandAutocomplete && interaction.commandName === 'clone') {
    const focusedValue = interaction.options.getFocused();
    const filtered = voices.filter(v => v.name.toLowerCase().includes(focusedValue.toLowerCase()));
    const sliced = filtered.slice(0, 24);

    await interaction.respond(
      sliced.map(v => ({ name: `${v.name}` , value: v.id }))
    );
  }

  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'clone_meme') {
    await interaction.reply({ 
      content: `Anexe algum arquivo MP3 ate 30 segundos de duracao e o maximo 3mb`, 
      ephemeral: true 
    });

    await collectionUploadFile(interaction);
  }
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
    const volume = interaction.fields.getTextInputValue('volume_input')

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
    const newBuffer = await speechToSpeech(selectedVoice.id, attachment.url);

    const result = await googleStorage.add(null, customId, newBuffer);

    if (!result.success) {
      await message.reply({ content: result.content, ephemeral: true });
      await message.delete();
      return;
    }

    const memeState = {
      memeId: customId,
      name,
      url: result.content,
      creator: interaction.user.id,
      volume: parseVolume(volume),
    };

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

async function addSound(memeState) {
  const { _id } = await memeRepository.store(memeState);
  return { success: true , content: memeState.name, soundId: _id };
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
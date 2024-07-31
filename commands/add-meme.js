const { SlashCommandBuilder, InteractionType } = require("discord.js");
const { memeRepository } = require('../repository/memes.repository');
const queryBuilder = require('../infra/mongodb/mongo-query-builder');
const { serverRepository }= require("../repository/server.repository");

function body() {
  try {    
    return new SlashCommandBuilder()
      .setName('addmeme')
      .setDescription('mostrando opcoes de memes para adicionar no seu servidor!')
      .addStringOption(option => 
        option.setName('meme')
          .setDescription('meme a ser adicionado!')
          .setAutocomplete(true)
          .setRequired(true)
      )
  } catch (error) {
    console.log('error on body playmeme.js', error);
  }
}

async function execute({ interaction }) {
  const { commandName } = interaction;
  const server = await serverRepository.findById(interaction.guildId);

  if (commandName === 'addmeme') {
    const meme = interaction.options.getString('meme');
    const query = { 
      memeId: meme,
    };    

    const sounds = await memeRepository.findAll(query);
    if (!sounds.length) {
      await interaction.reply({ content: 'meme nao encontrado!', ephemeral: true });
      return;
    }

    await memeRepository.addServerToMeme(sounds[0]?.memeId, server._id);
    await interaction.reply(`${interaction.user.username} adicionou  ${sounds[0]?.emoji || '😄'} ${sounds[0].name} no servidor!`);
  }
}

async function shuffleSounds(serverId) {
  const server = await serverRepository.findById(serverId);

  const query = {
    servers: queryBuilder.notIn(server._id),
  };

  const sounds = await memeRepository.findAll(query);
  const shuffled = [...sounds];

  for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

async function interaction({ interaction }) {
  const { commandName } = interaction;

  if (interaction.type === InteractionType.ApplicationCommandAutocomplete && commandName === 'addmeme') {
    const focusedValue = interaction.options.getFocused();
    const shuffledSounds = await shuffleSounds(interaction.guildId);
    const filtered = shuffledSounds.filter(sound => sound.name.toLowerCase().includes(focusedValue.toLowerCase()));
    const sliced = filtered.slice(0, 24);

    await interaction.respond(
      sliced.map(sound => ({ name: `${sound.emoji || '😄'}  ${sound.name}` , value: sound.memeId }))
    );
  }
}

module.exports = {
  body,
  execute,
  interaction,
}
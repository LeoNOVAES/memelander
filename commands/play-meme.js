const { SlashCommandBuilder, InteractionType } = require("discord.js");
const { clearTimeoutBot, playMeme } = require('../services/actionsService');
const { repository } = require('../repository/memes.repository');

function body() {
  try {    
    return new SlashCommandBuilder()
      .setName('playmeme')
      .setDescription('mostrando opcoes de memes!')
      .addStringOption(option => 
        option.setName('meme')
          .setDescription('meme a ser tocado')
          .setAutocomplete(true)
          .setRequired(true)
      )
  } catch (error) {
    console.log('error on body playmeme.js', error);
  }
}

async function execute({ interaction }) {
  const { commandName } = interaction;

  if (commandName === 'playmeme') {
    const meme = interaction.options.getString('meme');
    
    const query = repository.or(
      { url: meme },
      { name: meme }, 
      { memeId: meme }
    );

    const sounds = await repository.findAll(query);

    if (!sounds.length) {
      await interaction.reply({ content: 'meme nao encontrado!', ephemeral: true });
      return;
    }

    await playMeme(sounds[0].url, interaction);
    clearTimeoutBot();
    await interaction.reply(`${interaction.user.username} invocou em  ${sounds[0]?.emoji || '😄'} ${sounds[0].name}!`);
  }
}

async function shuffleSounds() {
  const sounds = await repository.findAll();
  const shuffled = [...sounds];

  for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

async function interaction({ interaction }) {
  const { commandName } = interaction;

  if (interaction.type === InteractionType.ApplicationCommandAutocomplete && commandName === 'playmeme') {
    const focusedValue = interaction.options.getFocused();
    const shuffledSounds = await shuffleSounds();
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
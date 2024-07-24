const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType } = require("discord.js");
const sounds = require('../sounds/sounds.json');
const { clearTimeoutBot, playMeme } = require('../actions');

function body() {
  const slashCommand = new SlashCommandBuilder()
    .setName('play')
    .setDescription('mostrando opcoes de memes!');

  slashCommand.addSubcommand(subCommand => 
    subCommand.setName('meme')
      .setDescription('play meme especifico')
      .addStringOption(option => 
        option.setName('meme')
          .setDescription('meme a ser tocado')
          .setAutocomplete(true)
          .setRequired(true)
  ));

  return slashCommand;
}

function createRowGroup(start, end) {
  console.log('creating group row');
  const colors = [
    { color: ButtonStyle.Primary },
    { color: ButtonStyle.Secondary },
    { color: ButtonStyle.Success },
    { color: ButtonStyle.Danger },
    { color: ButtonStyle.Primary },
    { color: ButtonStyle.Success },
  ]

  const rows = [];
  let action = new ActionRowBuilder();
  for (let i = start; i <= end; i++) {
    let actionsLength = action.components.length;

    if (actionsLength === 5) {
      rows.push(action);
      action = new ActionRowBuilder();
      actionsLength = 0;
    }

    if (!sounds[i]) break;

    const emoji = sounds[i]?.emoji || '🤣';

    action.addComponents(new ButtonBuilder()
        .setCustomId(sounds[i].id)
        .setLabel(`${emoji} ${sounds[i].name}`)
        .setStyle(colors[actionsLength]?.color));

    if (!sounds[i + 1]?.name && actionsLength < 5) {
      rows.push(action);
      break;
    }
  }

  return rows;
}

async function executeSubCommandMeme(interaction) {
  const { commandName } = interaction;

  if (commandName === 'play') {
    try {
      const subCommand = interaction?.options?.getSubcommand();

      if (subCommand !== 'meme') return;

      const meme = interaction.options.getString('meme');
      
      const sound = sounds.find(sound => sound.name === meme || sound.id === meme);

      if (!sound) {
        await interaction.reply({ content: 'meme nao encontrado!', ephemeral: true });
        return;
      }

      await playMeme(sound.url, interaction);
      await interaction.reply(`${interaction.user.username} invocou em ${sound.name}!`);
      return true;
    } catch (error) {
      console.log('Is not a subcommand!');
      return false;
    }
  }
}

async function execute({ interaction }) {
  const executed = await executeSubCommandMeme(interaction);

  if (executed) return;

  const { voice } = interaction.member;

  if (!voice.channel) {
    interaction.reply({ content: 'Voce precisa estar em um canal de voz para usar esse comando!', ephemeral: true });
    return;
  }

  await interaction.reply({ content: 'Carregando os memes...', ephemeral: true });
  
  const totalRows = Math.ceil(sounds.length/25);

  for (let i = 0; i < totalRows; i++) {
    const start = i * 25;
    const end = start + 25;

    const rows = createRowGroup(start, end, ButtonStyle.Primary);
    await interaction.followUp({ content: `Pagina ${i+1} de memes disponiveis:`, components: rows });
  }
}

function shuffleSounds() {
  const shuffled = [...sounds];
  for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

async function interaction({ interaction }) {
  const { commandName } = interaction;

  if (interaction.type === InteractionType.ApplicationCommandAutocomplete && commandName === 'play') {
    const focusedValue = interaction.options.getFocused();
    const shuffledSounds = shuffleSounds();
    const filtered = shuffledSounds.filter(sound => sound.name.toLowerCase().includes(focusedValue.toLowerCase()));
    const sliced = filtered.slice(0, 24);

    await interaction.respond(
      sliced.map(sound => ({ name: `${sound.emoji || '😄'}  ${sound.name}` , value: sound.id }))
    );
  }

  if (interaction.type === InteractionType.MessageComponent) {
    const from = interaction?.customId.split('_')[0];
  
    if (interaction.isButton && from === 'MEME') {
      clearTimeoutBot();
      const sound = sounds.find(sound => sound.id === interaction.customId);
  
      if (!sound) {
        await interaction.reply({ content: 'meme nao encontrado!', ephemeral: true });
        return;
      }
  
      await interaction.reply(`${interaction.user.username} clicou em ${sound.name}!`);
      await playMeme(sound.url, interaction);
    }
  }
}

module.exports = {
  body,
  execute,
  interaction,
}
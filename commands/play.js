const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType } = require("discord.js");
const sounds = require('../sounds/sounds.json');
const { clearTimeoutBot, playMeme } = require('../actions');

function body() {
  try {    
    return new SlashCommandBuilder()
      .setName('play')
      .setDescription('mostrando opcoes de memes!')
  } catch (error) {
    console.log('error on body play.js', error);
  }
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
    console.log('actions length', actionsLength);
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

async function execute({ interaction }) {
  const { voice } = interaction.member;

  if (!voice.channel) {
    interaction.reply({ content: 'Voce precisa estar em um canal de voz para usar esse comando!', ephemeral: true });
    return;
  }

  await interaction.reply({ content: 'Carregando os memes...', ephemeral: true });
  
  const totalRows = Math.ceil(sounds.length/25);
  console.log('total rows', totalRows);
  for (let i = 0; i < totalRows; i++) {
    const start = i * 25;
    const end = start + 25;

    const rows = createRowGroup(start, end, ButtonStyle.Primary);
    console.log('rows', rows.length);
    await interaction.followUp({ content: `Pagina ${i+1} de memes disponiveis:`, components: rows });
  }
}

async function interaction({ interaction }) {
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
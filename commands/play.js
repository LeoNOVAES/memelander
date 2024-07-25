const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType } = require("discord.js");
const { clearTimeoutBot, playMeme } = require('../actions');
const { repository } = require('../repository/memes.repository');

function body() {
  try {    
    return new SlashCommandBuilder()
      .setName('play')
      .setDescription('mostrando opcoes de memes!')
  } catch (error) {
    console.log('error on body play.js', error);
  }
}

async function sendRowGroupFollowUp(pages, interaction) {
  console.log('creating group row');
  const colors = [
    { color: ButtonStyle.Primary },
    { color: ButtonStyle.Secondary },
    { color: ButtonStyle.Success },
    { color: ButtonStyle.Danger },
    { color: ButtonStyle.Primary },
    { color: ButtonStyle.Success },
  ]

  for (let i = 0; i < pages; i++) {
    const rows = [];
    let action = new ActionRowBuilder();
    const sounds = await repository.findAllPaginated(i + 1);
    
    if (!sounds || !sounds.length) return;

    for (let j = 0; j < sounds.length; j++) {
      let actionsLength = action.components.length;
      const emoji = sounds[j]?.emoji || '🤣';

      if (actionsLength === 5) {
        rows.push(action);
        action = new ActionRowBuilder();
        actionsLength = action.components.length;
      }
  
      action.addComponents(new ButtonBuilder()
          .setCustomId(sounds[j].memeId)
          .setLabel(`${emoji} ${sounds[j].name}`)
          .setStyle(colors[actionsLength]?.color));

      if (!sounds[j + 1]?.name) {
        rows.push(action);
      }
    }

    await interaction.followUp({ content: `Pagina ${i+1} de memes disponiveis:`, components: [...rows] });
  }
}

async function execute({ interaction }) {
  const { voice } = interaction.member;

  if (!voice.channel) {
    interaction.reply({ content: 'Voce precisa estar em um canal de voz para usar esse comando!', ephemeral: true });
    return;
  }

  await interaction.reply({ content: 'Carregando os memes...', ephemeral: true });
  const total = await repository.count();
  const totalPages = Math.ceil(total / 25);
  console.log('total totalPages', totalPages);
  await sendRowGroupFollowUp(totalPages, interaction);
}

async function interaction({ interaction }) {
  if (interaction.type === InteractionType.MessageComponent) {
    const from = interaction?.customId.split('_')[0];
  
    if (interaction.isButton && from === 'MEME') {
      clearTimeoutBot();

      const sound = await repository.findById(interaction.customId);
  
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
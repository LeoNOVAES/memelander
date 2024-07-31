const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionType } = require("discord.js");
const { clearTimeoutBot, playMeme } = require('../services/actionsService');
const { memeRepository } = require('../repository/memes.repository');
const { serverRepository } = require('../repository/server.repository');

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
  const server = await serverRepository.findById(interaction.guildId);

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
    
    const query = { 
      servers: server._id,
    };

    const sounds = await memeRepository.findAllPaginated(query, i + 1);
    
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

    await interaction.followUp({ content: `Pagina ${i+1} de memes disponiveis:`, components: [...rows],  ephemeral: true  });
  }
}

async function execute({ interaction }) {
  const server = await serverRepository.findById(interaction.guildId);
  const { voice } = interaction.member;

  if (!voice.channel) {
    interaction.reply({ content: 'Voce precisa estar em um canal de voz para usar esse comando!', ephemeral: true });
    return;
  }

  await interaction.reply({ content: 'Carregando os memes...', ephemeral: true });
  const query = {
    servers: server._id,
  }
  const total = await memeRepository.count(query);

  if (total === 0) {
    await interaction.followUp({ content: 'Nenhum meme cadastrado! por favor use o comando /add e depois o botao adicionar memes!', ephemeral: true });
    return;
  }

  const totalPages = Math.ceil(total / 25);
  console.log('total totalPages', totalPages);
  await sendRowGroupFollowUp(totalPages, interaction);
}

async function interaction({ interaction }) {
  if (interaction.type === InteractionType.MessageComponent) {
    const from = interaction?.customId.split('_')[0];

    if (interaction.isButton && from === 'MEME') {
      clearTimeoutBot();

      const sound = await memeRepository.findById(interaction.customId);
  
      if (!sound) {
        await interaction.reply({ content: 'meme nao encontrado!', ephemeral: true });
        return;
      }
  
      await interaction.reply(`${interaction.user.username} clicou em ${sound.emoji} ${sound.name}!`);
      await playMeme(sound.url, sound?.volume, interaction);
    }
  }
}

module.exports = {
  body,
  execute,
  interaction,
}
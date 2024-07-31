const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { memeRepository } = require("../../repository/memes.repository");

const render = async (pages, interaction, server) => {
  console.log('creating group row');
  let query = {};
  
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
    
    if (server) {
      query = { 
        servers: server._id,
      };
    }

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
          .setCustomId(`ADD-${sounds[j].memeId}`)
          .setLabel(`${emoji} ${sounds[j].name}`)
          .setStyle(colors[actionsLength]?.color));

      if (!sounds[j + 1]?.name) {
        rows.push(action);
      }
    }

    await interaction.followUp({ content: `Pagina ${i+1} de memes disponiveis:`, components: [...rows],  ephemeral: true  });
  }
}

module.exports = render;
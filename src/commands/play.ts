import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    InteractionType,
} from 'discord.js';
import { clearTimeoutBot, playMeme } from '../services/actionsService';
import * as memeRepository from '../repository/memes.repository';
import * as serverRepository from '../repository/server.repository';

export function body(): SlashCommandBuilder {
    try {
        return new SlashCommandBuilder()
            .setName('play')
            .setDescription('mostrando opcoes de memes!');
    } catch (error) {
        console.log('error on body play.js', error);
        throw error;
    }
}

export async function sendRowGroupFollowUp(pages: number, interaction: any): Promise<void> {
    console.log('creating group row');
    const colors = [
        { color: ButtonStyle.Primary },
        { color: ButtonStyle.Secondary },
        { color: ButtonStyle.Success },
        { color: ButtonStyle.Danger },
        { color: ButtonStyle.Primary },
        { color: ButtonStyle.Success },
    ];

    for (let i = 0; i < pages; i++) {
        const rows = [];
        let action = new ActionRowBuilder();
        const sounds = await memeRepository.findAllPaginated(i + 1);

        if (!sounds || !sounds.length) return;

        for (let j = 0; j < sounds.length; j++) {
            let actionsLength = action.components.length;
            const emoji = sounds[j]?.emoji || '🤣';

            if (actionsLength === 5) {
                rows.push(action);
                action = new ActionRowBuilder();
                actionsLength = action.components.length;
            }

            action.addComponents(
                new ButtonBuilder()
                    .setCustomId(sounds[j].memeId)
                    .setLabel(`${emoji} ${sounds[j].name}`)
                    .setStyle(colors[actionsLength]?.color)
            );

            if (!sounds[j + 1]?.name) {
                rows.push(action);
            }
        }

        await interaction.followUp({
            content: `Pagina ${i + 1} de memes disponiveis:`,
            components: [...rows],
            ephemeral: true,
        });
    }
}

export async function execute(interaction: any): Promise<void> {
    const { voice } = interaction.member;
    const server = await serverRepository.findById(interaction.guildId);

    if (!voice.channel) {
        interaction.reply({
            content: 'Voce precisa estar em um canal de voz para usar esse comando!',
            ephemeral: true,
        });
        return;
    }

    await interaction.reply({
        content: 'Carregando os memes...',
        ephemeral: true,
    });
    const query = {
        servers: server._id || interaction.guildId,
    }
    const total = await memeRepository.count(query);
    const totalPages = Math.ceil(total / 25);
    console.log('total totalPages', totalPages);
    await sendRowGroupFollowUp(totalPages, interaction);
}

export async function interaction(interaction: any): Promise<void> {
    if (interaction.type === InteractionType.MessageComponent) {
        const from = interaction?.customId.split('_')[0];

        if (interaction.isButton && from === 'MEME') {
            clearTimeoutBot();

            const sound = await memeRepository.findById(interaction.customId);

            if (!sound) {
                await interaction.reply({
                    content: 'meme nao encontrado!',
                    ephemeral: true,
                });
                return;
            }

            await interaction.reply(
                `${interaction.user.username} clicou em ${sound.name}!`
            );
            await playMeme(sound.url, sound?.volume, interaction);
        }
    }
}

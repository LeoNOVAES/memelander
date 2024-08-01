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
import { render as MemeButtonsComponent } from './shared-components/meme-buttons'

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

export async function execute(interaction: any): Promise<void> {
    const server = await serverRepository.findById(interaction.guildId);
    const { voice } = interaction.member;

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
    if (total === 0) {
        await interaction.followUp({ content: 'Nenhum meme cadastrado! por favor use o comando /add e depois o botao adicionar memes!', ephemeral: true });
        return;
    }
    const totalPages = Math.ceil(total / 25);
    console.log('total totalPages', totalPages);
    await MemeButtonsComponent(totalPages, interaction, query);
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

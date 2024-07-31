import {
    SlashCommandBuilder,
    Interaction,
} from 'discord.js';
import { clearTimeoutBot, joinChannel, startDisconnectTimer } from '../services/actionsService';
import * as memeRepository from '../repository/memes.repository';
import { createAudioPlayer, createAudioResource } from '@discordjs/voice';

const TIMEOUT = 10_000;
const MAX_MEMES_NUMBER = 5;

export function body() {
    try {
        return new SlashCommandBuilder()
            .setName('shuffle')
            .setDescription(`Toque até ${MAX_MEMES_NUMBER} memes`)
            .addStringOption(option =>
                option
                    .setName('quantia')
                    .setDescription('Quantos memes, patrão?')
                    .setRequired(true)
            );
    } catch (error) {
        console.log('error on body play.js', error);
        throw error;
    }
}

export async function execute(interaction: any): Promise<void> {
    try {
        const { voice } = interaction.member;

        if (!voice.channel) {
            await interaction.reply({ content: 'Voce precisa estar em um canal de voz para usar esse comando!', ephemeral: true });
            return;
        }

        const randomness = Number(interaction.options.getString('quantia'));

        if (randomness <= 1 || isNaN(randomness)) {
            await interaction.reply({ content: 'Sério? kkkkkkk', ephemeral: true });
            return;
        }

        if (randomness > MAX_MEMES_NUMBER) {
            await interaction.reply({ content: `Mais que ${MAX_MEMES_NUMBER} não pode não, chefe`, ephemeral: true });
            return;
        }

        const memes = await memeRepository.random(randomness);
        const urls = memes.map(meme => meme.url);
        await playMeme(urls, interaction, memes);
    } catch (error) {
        console.log(error);
    }
}

export async function interaction(interaction: Interaction): Promise<void> {
    // Placeholder for any additional interaction handling (if needed)
}

const playMeme = async (urls: string[], interaction: any, memes: any[]): Promise<void> => {
    if (!interaction || !interaction?.member || !interaction?.member?.voice?.channel) return;

    const voiceChannel = interaction.member.voice.channel;
    const connection = joinChannel(voiceChannel);

    const player = createAudioPlayer({ debug: true });

    const songs = urls.map(url => createAudioResource(url, { inlineVolume: true }));

    songs.forEach((song: any, index) => {
        song.volume.setVolume(0.2);

        if (index === 0) {
            player.play(song);
        } else {
            setTimeout(() => player.play(song), TIMEOUT);
        }
    });

    connection.subscribe(player);

    let content = `${songs.length} memes: \n`;

    memes.forEach(meme => {
        content += `${meme.emoji} - ${meme.name} \n`;
    });

    await interaction.reply({ content, ephemeral: true });

    clearTimeoutBot();
    startDisconnectTimer(voiceChannel);
};
import { SlashCommandBuilder, InteractionType } from 'discord.js';
import { clearTimeoutBot, playMeme } from '../services/actionsService';
import * as memeRepository from '../repository/memes.repository';
import * as queryBuilder from '../infra/mongodb/mongo-query-builder';

export function body() {
    // @ts-ignore: Unreachable code error
    return new SlashCommandBuilder()
        .setName('playmeme')
        .setDescription('mostrando opcoes de memes!')
        .addStringOption(option =>
            option
                .setName('meme')
                .setDescription('meme a ser tocado')
                .setAutocomplete(true)
                .setRequired(true)
        );
}

export async function execute(interaction: any): Promise<void> {
    const { commandName } = interaction;

    if (commandName === 'playmeme') {
        const meme = interaction.options.getString('meme');

        const query = queryBuilder.or(
            { url: meme },
            { name: meme },
            { memeId: meme }
        );

        const sounds: any[] = await memeRepository.findAll(query);

        if (!sounds.length) {
            await interaction.reply({ content: 'meme nao encontrado!', ephemeral: true });
            return;
        }

        await playMeme(sounds[0].url, sounds[0]?.volume, interaction);
        clearTimeoutBot();
        await interaction.reply(`${interaction.user.username} invocou em  ${sounds[0]?.emoji || '😄'} ${sounds[0].name}!`);
    }
}

async function shuffleSounds(): Promise<any[]> {
    const sounds: any[] = await memeRepository.findAll({});
    const shuffled = [...sounds];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

export async function interaction(interaction: any): Promise<void> {
    const { commandName } = interaction;

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete && commandName === 'playmeme') {
        const focusedValue = interaction.options.getFocused();
        const shuffledSounds = await shuffleSounds();
        const filtered = shuffledSounds.filter(sound => sound.name.toLowerCase().includes(focusedValue.toLowerCase()));
        const sliced = filtered.slice(0, 24);

        await interaction.respond(
            sliced.map(sound => ({ name: `${sound.emoji || '😄'}  ${sound.name}`, value: sound.memeId }))
        );
    }
}



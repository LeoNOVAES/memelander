const { SlashCommandBuilder } = require("discord.js");
const { clearTimeoutBot, joinChannel, startDisconnectTimer } = require('../services/actionsService');
const { repository } = require('../repository/memes.repository');
const { createAudioPlayer, createAudioResource } = require('@discordjs/voice');

const TIMEOUT = 10_000
const MAX_MEMES_NUMBER = 5

function body() {
    try {
        return new SlashCommandBuilder()
            .setName('shuffle')
            .setDescription(`Toque até ${MAX_MEMES_NUMBER} memes`)
            .addStringOption(option =>
                option.setName('quantia')
                    .setDescription('Quantos memes, patrão?')
                    .setRequired(true)
            )

    } catch (error) {
        console.log('error on body play.js', error);
    }
}

async function execute({ interaction, client }) {

    try {
        const { voice } = interaction.member;

        if (!voice.channel) {
            interaction.reply({ content: 'Voce precisa estar em um canal de voz para usar esse comando!', ephemeral: true });
            return;
        }

        const randomness = Number(interaction.options._hoistedOptions[0].value)

        if (randomness <= 1 || isNaN(randomness)) {
            interaction.reply({ content: "Sério? kkkkkkk", ephemeral: true });
            return;
        }

        if (randomness > MAX_MEMES_NUMBER) {
            interaction.reply({ content: `Mais que ${MAX_MEMES_NUMBER} não pode não, chefe`, ephemeral: true });
            return;
        }

        const memes = await repository.random(randomness);
        const urls = memes.map(meme => meme.url)
        await playMeme(urls, interaction, memes, client);
    } catch (error) {
        console.log(error)
    }
}

async function interaction({ interaction, }) {

}

const playMeme = async (urls, interaction, memes, client) => {
    if (!interaction || !interaction?.member || !interaction?.member?.voice?.channel) return;

    const voiceChannel = interaction.member.voice.channel;
    const connection = joinChannel(voiceChannel, interaction.guild);

    const player = createAudioPlayer({ debug: true });

    const songs = []

    urls.forEach(url => {
        songs.push(createAudioResource(url, { inlineVolume: true }));
    })

    songs.forEach((song, index) => {
        song.volume.setVolume(0.2)

        if (index == 0) {
            player.play(song)
        } else {
            setTimeout(() => player.play(song), TIMEOUT);
        }
    })

    connection.subscribe(player);

    let content = `${songs.length} memes: \n`

    memes.forEach(meme => {
        content += `${meme.emoji} - ${meme.name} \n`
    })

    await interaction.reply({ content, ephemeral: true });

    clearTimeoutBot();
    startDisconnectTimer(voiceChannel);
}

module.exports = {
    body,
    execute,
    interaction,
}
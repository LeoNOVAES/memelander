import {
    getVoiceConnection,
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
} from '@discordjs/voice';

const TIMEOUT_DISCONNECT = 60 * 60 * 1000; // 1 hour in milliseconds
let disconnectTimeout: NodeJS.Timeout;

export const disconnectBot = (voiceChannel: any): void => {
    clearTimeoutBot();
    const connection = getVoiceConnection(voiceChannel.guild.id);
    if (connection) {
        connection.destroy();
        console.log('Bot has left the voice channel due to inactivity.');
    }
};

export const startDisconnectTimer = (voiceChannel: any): void => {
    disconnectTimeout = setTimeout(() => {
        disconnectBot(voiceChannel);
    }, TIMEOUT_DISCONNECT);
};

export const clearTimeoutBot = (): void => {
    clearTimeout(disconnectTimeout);
};

export const joinChannel = (voiceChannel: any): any => {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    return connection;
};

export const playMeme = async (url: string, volume: number, interaction: any): Promise<void> => {
    if (!interaction || !interaction?.member || !interaction?.member?.voice?.channel) return;

    const voiceChannel = interaction.member.voice.channel;
    const connection = joinChannel(voiceChannel);

    const player = createAudioPlayer();
    const song = createAudioResource(url, { inlineVolume: true });
    song?.volume?.setVolume(volume || 0.4);

    player.play(song);
    connection.subscribe(player);

    clearTimeoutBot();
    startDisconnectTimer(voiceChannel);
};


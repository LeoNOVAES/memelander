import {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Message,
    VoiceState,
    RepliableInteraction
} from 'discord.js'
import { Player } from 'discord-player'
import { Routes } from 'discord-api-types/v9'
import path from 'path'
import fs, { readFileSync } from 'fs'
import { disconnectBot } from './v2/services/actionsService';
import { connect, close } from './v2/infra/mongodb/mongodb'
import { upsert } from './v2/repository/server.repository'
require('dotenv/config');

const CHANNEL_NAME = 'memelander';
const CHANNEL_IDS: (string | null)[] = ["1266666976554782721", "1266676852395872379", "1266659019834265610"];

const COMMANDS: any[] = [];
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;

async function main() {
    await connect();
}
type mergedStuff = Client & Player & any
function createClient() {
    const client: any = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
        ]
    });

    client.config = {
        version: JSON.parse(readFileSync("./package.json").toString()).version,
        token_discord: process.env.TOKEN_DISCORD,
        default_lang: process.env.DEFAULT_LANG ?? "en",
    };

    client.modals = {
        categories: new Collection(),
        list: new Collection(),
    };

    client.buttons = {
        categories: new Collection(),
        list: new Collection(),
    };

    client.commands = {
        categories: new Collection(),
        list: new Collection(),
    };

    client.commands = new Collection()

    const commandsPath = path.join(__dirname, 'v2/commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if (!command || !command?.body) continue;

        const body = command.body()

        if (!body) continue;

        console.log(`Command ${body.name} loaded!`);

        client.commands.set(body.name, command);
        COMMANDS.push(body.toJSON());
    }

    const player = new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
        },
    });

    client.player = player

    return client;
}

async function registerCommands(client: Client) {

    let guildIDS: string[] = client.guilds.cache.map(guild => guild.id);

    const rest = new REST({ version: '10' }).setToken(String(process.env.TOKEN));

    for (const guildID of guildIDS) {
        if (!guildID) continue;

        const guild = client.guilds.cache.get(guildID);

        if (!guild) return

        const channel = guild.channels.cache.find(ch => ch.name === CHANNEL_NAME);

        await upsert({ serverId: guildID, name: guild.name });

        if (channel) {
            CHANNEL_IDS.push(channel.id);
        }

        try {
            await rest.put(Routes.applicationCommands(String(process.env.CLIENT_ID)), { body: COMMANDS });
            console.log(`Successfully registered application commands globally mode: (${process.env.NODE_ENV}) -> ${guildID}`);
        } catch (error) {
            console.error('Error registering commands:', error);
        }
    }
}

const client = createClient();

client.login(process.env.TOKEN);

client.on('ready', async () => {
    await registerCommands(client);
    console.log(`Bot is ready!`);
});

client.on('messageCreate', async (message: Message) => {
    if (message.content === 'ping') {
        message.reply('pong');
    }

    for (const [key] of client.commands.entries()) {
        const command = client.commands.get(key);

        if (message && command?.messages) {
            await command.messages({ message });
        }
    };
});

client.on('interactionCreate', async (interaction: any) => {
    try {

        if (!CHANNEL_IDS.includes(interaction.channelId)) {

            await interaction.reply({ content: 'Apenas envie meme no canal #memelander!', ephemeral: true });

            return;
        }

        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }

            return;
        }

        for (const [key] of client.commands.entries()) {
            const command = client.commands.get(key);

            if (interaction && command?.interaction) {
                await command.interaction(interaction);
            }
        };
    } catch (error) {
        console.log('Error on interactionCreate:', error);
    }
});

client.on('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => {
    const voiceChannel = oldState.channel || newState.channel;

    if (voiceChannel && voiceChannel.members.size === 1 && voiceChannel.members.has(client.user.id)) {
        disconnectBot(voiceChannel);
    }
});



process.on('SIGINT', async () => {
    console.log('Received SIGINT. Closing MongoDB connection...');
    // await close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Closing MongoDB connection...');
    // await close();
    process.exit(0);
});

main();
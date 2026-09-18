import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { initMusic } from './features/music.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function createBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message],
  });

  client.commands = new Collection();

  // Chargement des commandes
  const commandsDir = join(__dirname, 'commands');
  for (const file of readdirSync(commandsDir).filter((f) => f.endsWith('.js'))) {
    const command = await import(pathToFileURL(join(commandsDir, file)).href);
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }

  // Chargement des events
  const eventsDir = join(__dirname, 'events');
  for (const file of readdirSync(eventsDir).filter((f) => f.endsWith('.js'))) {
    const event = await import(pathToFileURL(join(eventsDir, file)).href);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(client, ...args));
    } else {
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  }

  // Musique (Lavalink)
  initMusic(client);

  return client;
}

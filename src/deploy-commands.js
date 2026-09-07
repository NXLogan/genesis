import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const commandsDir = join(__dirname, 'bot/commands');

const commands = [];
for (const file of readdirSync(commandsDir).filter((f) => f.endsWith('.js'))) {
  const command = await import(pathToFileURL(join(commandsDir, file)).href);
  if (command.data) commands.push(command.data.toJSON());
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

console.log(`⏳ Déploiement de ${commands.length} commandes sur le serveur ${process.env.GUILD_ID}...`);
await rest.put(
  Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.GUILD_ID),
  { body: commands }
);
console.log('✅ Commandes déployées !');

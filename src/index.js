import 'dotenv/config';
import { createBot } from './bot/client.js';
import { startWebServer } from './web/server.js';

const required = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'GUILD_ID'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Variables manquantes dans .env : ${missing.join(', ')}`);
  console.error('   Copie .env.example vers .env et remplis les valeurs.');
  process.exit(1);
}

const client = await createBot();

client.once('clientReady', () => {
  startWebServer(client);
});

await client.login(process.env.DISCORD_TOKEN);

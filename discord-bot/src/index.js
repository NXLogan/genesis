import 'dotenv/config';
import { startWebServer } from './web/server.js';

const required = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'GUILD_ID'];
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  console.warn(`⚠️  Variables Discord manquantes : ${missing.join(', ')}`);
  console.warn('   Panel web démarré sans bot (accès libre). Remplis .env pour activer le bot.');
  startWebServer(null);
} else {
  const { createBot } = await import('./bot/client.js');
  const client = await createBot();
  client.once('clientReady', () => {
    startWebServer(client);
  });
  await client.login(process.env.DISCORD_TOKEN);
}

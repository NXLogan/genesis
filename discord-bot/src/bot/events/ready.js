import { ActivityType, Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client) {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'le projet GTA6 🎮', type: ActivityType.Watching }],
    status: 'online',
  });

  // Pré-charge le serveur et ses membres pour le panel web
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) {
    console.warn(`⚠️ Le bot n'est pas sur le serveur ${process.env.GUILD_ID}. Invite-le d'abord !`);
    return;
  }
  await guild.members.fetch().catch(() => null);
  console.log(`📡 Serveur : ${guild.name} (${guild.memberCount} membres)`);
}

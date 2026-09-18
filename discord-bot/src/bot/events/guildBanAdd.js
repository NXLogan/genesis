import { AuditLogEvent, Events } from 'discord.js';
import { handleDestructiveAction } from '../features/security.js';
import { baseEmbed, COLORS, sendLog } from '../utils.js';

export const name = Events.GuildBanAdd;

export async function execute(client, ban) {
  if (ban.guild.id !== process.env.GUILD_ID) return;

  await sendLog(
    client,
    baseEmbed(COLORS.danger)
      .setTitle('🔨 Membre banni')
      .setDescription(`\`${ban.user.tag}\` a été banni du serveur.`)
  );

  await handleDestructiveAction(client, ban.guild, AuditLogEvent.MemberBanAdd);
}

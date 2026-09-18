import { AuditLogEvent, Events } from 'discord.js';
import { handleDestructiveAction } from '../features/security.js';

export const name = Events.GuildRoleDelete;

export async function execute(client, role) {
  if (role.guild.id !== process.env.GUILD_ID) return;
  await handleDestructiveAction(client, role.guild, AuditLogEvent.RoleDelete);
}

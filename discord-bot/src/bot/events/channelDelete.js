import { AuditLogEvent, Events } from 'discord.js';
import { handleDestructiveAction } from '../features/security.js';

export const name = Events.ChannelDelete;

export async function execute(client, channel) {
  if (!channel.guild || channel.guild.id !== process.env.GUILD_ID) return;
  await handleDestructiveAction(client, channel.guild, AuditLogEvent.ChannelDelete);
}

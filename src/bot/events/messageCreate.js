import { Events } from 'discord.js';
import { handleMessageSecurity } from '../features/security.js';
import { recordTicketMessage } from '../features/tickets.js';

export const name = Events.MessageCreate;

export async function execute(client, message) {
  if (!message.guild || message.guild.id !== process.env.GUILD_ID) return;

  // Transcript des tickets
  recordTicketMessage(message);

  // Anti-invite + anti-spam
  await handleMessageSecurity(client, message);
}

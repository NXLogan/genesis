import { Events } from 'discord.js';
import { baseEmbed, COLORS, sendLog, truncate } from '../utils.js';
import { getConfig } from '../../db/index.js';

export const name = Events.MessageDelete;

export async function execute(client, message) {
  if (!message.guild || message.guild.id !== process.env.GUILD_ID) return;
  if (message.partial || !message.author || message.author.bot) return;
  if (message.channel.id === getConfig('logs_channel_id')) return;

  await sendLog(
    client,
    baseEmbed(COLORS.danger)
      .setTitle('🗑️ Message supprimé')
      .setDescription(
        `**Auteur :** ${message.author} (\`${message.author.tag}\`)\n**Salon :** ${message.channel}`
      )
      .addFields({ name: 'Contenu', value: truncate(message.content || '[embed / pièce jointe]', 1024) })
  );
}

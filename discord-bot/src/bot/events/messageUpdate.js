import { Events } from 'discord.js';
import { baseEmbed, COLORS, sendLog, truncate } from '../utils.js';

export const name = Events.MessageUpdate;

export async function execute(client, oldMessage, newMessage) {
  if (!newMessage.guild || newMessage.guild.id !== process.env.GUILD_ID) return;
  if (newMessage.partial || oldMessage.partial) return;
  if (!newMessage.author || newMessage.author.bot) return;
  if (oldMessage.content === newMessage.content) return;

  await sendLog(
    client,
    baseEmbed(COLORS.warning)
      .setTitle('✏️ Message modifié')
      .setDescription(
        `**Auteur :** ${newMessage.author} (\`${newMessage.author.tag}\`)\n**Salon :** ${newMessage.channel} — [Aller au message](${newMessage.url})`
      )
      .addFields(
        { name: 'Avant', value: truncate(oldMessage.content || '[vide]', 1024) },
        { name: 'Après', value: truncate(newMessage.content || '[vide]', 1024) }
      )
  );
}

import { getConfig, PatchNotes } from '../../db/index.js';
import { baseEmbed, COLORS, truncate } from '../utils.js';

/**
 * Publie un patch note dans le salon configuré et l'enregistre en base.
 * Utilisé par la commande /patchnote et par le panel web.
 * @returns {{ ok: boolean, error?: string, id?: number }}
 */
export async function publishPatchNote(client, { version, title, content, authorId, authorTag }) {
  const channelId = getConfig('patchnotes_channel_id');
  if (!channelId) {
    return { ok: false, error: "Le salon des patch notes n'est pas configuré." };
  }
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased()) {
    return { ok: false, error: 'Le salon des patch notes est introuvable.' };
  }

  const id = PatchNotes.create(version, title, content, authorId, authorTag);

  const embed = baseEmbed(COLORS.primary)
    .setTitle(`🛠️ Patch Note ${version} — ${title}`)
    .setDescription(truncate(content, 4000))
    .setFooter({ text: `Publié par ${authorTag}` });

  const message = await channel.send({ embeds: [embed] });
  PatchNotes.setMessage(id, message.id);

  return { ok: true, id };
}

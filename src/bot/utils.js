import { EmbedBuilder } from 'discord.js';
import { getConfig } from '../db/index.js';

export const COLORS = {
  primary: 0x5865f2,
  success: 0x57f287,
  danger: 0xed4245,
  warning: 0xfee75c,
  info: 0x00b0f4,
};

export function baseEmbed(color = COLORS.primary) {
  return new EmbedBuilder().setColor(color).setTimestamp();
}

/** Envoie un embed dans le salon de logs configuré (silencieux si non configuré). */
export async function sendLog(client, embed) {
  try {
    const channelId = getConfig('logs_channel_id');
    if (!channelId) return;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (channel?.isTextBased()) await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error('Erreur envoi log :', err.message);
  }
}

/** Tronque un texte à une longueur max (limites Discord). */
export function truncate(text, max = 1024) {
  if (!text) return text;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

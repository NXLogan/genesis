import { Sanctions } from '../../db/index.js';
import { baseEmbed, COLORS, sendLog } from '../utils.js';

const LABELS = {
  ban: { emoji: '🔨', label: 'Bannissement', color: COLORS.danger },
  kick: { emoji: '👢', label: 'Expulsion', color: COLORS.danger },
  mute: { emoji: '🔇', label: 'Mute', color: COLORS.warning },
  unmute: { emoji: '🔊', label: 'Unmute', color: COLORS.success },
  warn: { emoji: '⚠️', label: 'Avertissement', color: COLORS.warning },
};

/**
 * Enregistre une sanction, envoie un MP au membre et un log.
 * @param {object} opts { type, user, moderator, reason, duration, guild, client }
 */
export async function applySanction({ type, user, moderator, reason, duration = null, guild, client }) {
  const { emoji, label, color } = LABELS[type];

  Sanctions.add(type, user.id, user.tag, moderator.id, moderator.tag, reason, duration);

  // MP au membre (avant le ban/kick sinon impossible)
  await user
    .send({
      embeds: [
        baseEmbed(color)
          .setTitle(`${emoji} ${label} — ${guild.name}`)
          .setDescription(
            `**Motif :** ${reason || 'Aucun motif fourni'}` + (duration ? `\n**Durée :** ${duration}` : '')
          ),
      ],
    })
    .catch(() => null);

  await sendLog(
    client,
    baseEmbed(color)
      .setTitle(`${emoji} ${label}`)
      .setDescription(
        `**Membre :** <@${user.id}> (\`${user.tag}\`)\n` +
          `**Modérateur :** <@${moderator.id}> (\`${moderator.tag}\`)\n` +
          `**Motif :** ${reason || 'Aucun motif fourni'}` +
          (duration ? `\n**Durée :** ${duration}` : '')
      )
  );

  return { emoji, label };
}

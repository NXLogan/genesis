import { GuildVerificationLevel, PermissionFlagsBits } from 'discord.js';
import { getConfig, Sanctions } from '../../db/index.js';
import { baseEmbed, COLORS, sendLog, truncate } from '../utils.js';

// Suivi en mémoire (fenêtres glissantes)
const spamTracker = new Map(); // userId -> timestamps[]
const joinTracker = []; // timestamps des arrivées
const nukeTracker = new Map(); // executorId -> timestamps[]
let raidLockActive = false;

const INVITE_REGEX = /(discord\.(gg|io|me)|discord(app)?\.com\/invite)\/[\w-]+/i;

function isExempt(member) {
  if (!member) return true;
  if (member.user?.bot) return false;
  const staffRoleId = getConfig('staff_role_id');
  return (
    member.permissions.has(PermissionFlagsBits.Administrator) ||
    member.permissions.has(PermissionFlagsBits.ManageMessages) ||
    (staffRoleId && member.roles.cache.has(staffRoleId))
  );
}

/** Anti-invite + anti-spam, appelé sur chaque message. */
export async function handleMessageSecurity(client, message) {
  if (!message.guild || message.author.bot) return;
  const member = message.member;
  if (isExempt(member)) return;

  // --- Anti-invite ---
  if (getConfig('antiinvite_enabled') && INVITE_REGEX.test(message.content)) {
    await message.delete().catch(() => null);
    const warning = await message.channel
      .send({ content: `⛔ ${message.author}, les liens d'invitation Discord sont interdits.` })
      .catch(() => null);
    if (warning) setTimeout(() => warning.delete().catch(() => null), 5000);

    await sendLog(
      client,
      baseEmbed(COLORS.danger)
        .setTitle("🔗 Lien d'invitation supprimé")
        .setDescription(
          `**Auteur :** ${message.author} (\`${message.author.tag}\`)\n**Salon :** ${message.channel}\n**Contenu :** ${truncate(message.content, 512)}`
        )
    );
    return;
  }

  // --- Anti-spam ---
  if (!getConfig('antispam_enabled')) return;

  const now = Date.now();
  const interval = getConfig('antispam_interval_seconds') * 1000;
  const maxMessages = getConfig('antispam_max_messages');

  const timestamps = (spamTracker.get(message.author.id) ?? []).filter((t) => now - t < interval);
  timestamps.push(now);
  spamTracker.set(message.author.id, timestamps);

  if (timestamps.length >= maxMessages) {
    spamTracker.delete(message.author.id);
    const muteMinutes = getConfig('antispam_mute_minutes');

    if (member?.moderatable) {
      await member.timeout(muteMinutes * 60 * 1000, 'Anti-spam automatique').catch(() => null);
      Sanctions.add(
        'mute',
        message.author.id,
        message.author.tag,
        client.user.id,
        `${client.user.username} (auto)`,
        'Anti-spam automatique',
        `${muteMinutes} min`
      );

      await message.channel
        .send({
          content: `🔇 ${message.author} a été rendu muet **${muteMinutes} min** (spam détecté).`,
        })
        .catch(() => null);

      await sendLog(
        client,
        baseEmbed(COLORS.danger)
          .setTitle('🔇 Anti-spam : mute automatique')
          .setDescription(
            `**Membre :** ${message.author} (\`${message.author.tag}\`)\n**Durée :** ${muteMinutes} min\n**Salon :** ${message.channel}`
          )
      );
    }
  }
}

/** Anti-raid, appelé sur chaque arrivée de membre. */
export async function handleJoinSecurity(client, member) {
  if (!getConfig('antiraid_enabled') || raidLockActive) return;

  const now = Date.now();
  const interval = getConfig('antiraid_interval_seconds') * 1000;
  const maxJoins = getConfig('antiraid_max_joins');

  joinTracker.push(now);
  while (joinTracker.length && now - joinTracker[0] > interval) joinTracker.shift();

  if (joinTracker.length >= maxJoins) {
    raidLockActive = true;
    joinTracker.length = 0;

    const guild = member.guild;
    const previousLevel = guild.verificationLevel;
    await guild
      .setVerificationLevel(GuildVerificationLevel.VeryHigh, 'Anti-raid : joins massifs détectés')
      .catch(() => null);

    await sendLog(
      client,
      baseEmbed(COLORS.danger)
        .setTitle('🚨 ANTI-RAID DÉCLENCHÉ')
        .setDescription(
          `**${maxJoins}+ arrivées** en ${getConfig('antiraid_interval_seconds')}s détectées.\n` +
            'Le niveau de vérification du serveur a été monté au **maximum** pendant **10 minutes**.\n' +
            '@here Vérifiez les nouveaux arrivants !'
        )
    );

    // Retour à la normale après 10 minutes
    setTimeout(async () => {
      await guild.setVerificationLevel(previousLevel, 'Fin du verrouillage anti-raid').catch(() => null);
      raidLockActive = false;
      await sendLog(
        client,
        baseEmbed(COLORS.success)
          .setTitle('✅ Verrouillage anti-raid levé')
          .setDescription('Le niveau de vérification est revenu à la normale.')
      );
    }, 10 * 60 * 1000);
  }
}

/**
 * Anti-nuke : surveille les actions destructrices (suppression de salons/rôles, bans)
 * via les audit logs. Si un membre dépasse le seuil, on lui retire ses rôles.
 */
export async function handleDestructiveAction(client, guild, auditLogType) {
  if (!getConfig('antinuke_enabled')) return;

  const logs = await guild
    .fetchAuditLogs({ type: auditLogType, limit: 1 })
    .catch(() => null);
  const entry = logs?.entries.first();
  if (!entry) return;

  const executorId = entry.executorId;
  if (!executorId || executorId === client.user.id) return;
  if (executorId === guild.ownerId) return;

  const now = Date.now();
  const interval = getConfig('antinuke_interval_seconds') * 1000;
  const maxActions = getConfig('antinuke_max_actions');

  const timestamps = (nukeTracker.get(executorId) ?? []).filter((t) => now - t < interval);
  timestamps.push(now);
  nukeTracker.set(executorId, timestamps);

  if (timestamps.length >= maxActions) {
    nukeTracker.delete(executorId);

    const member = await guild.members.fetch(executorId).catch(() => null);
    if (member && member.manageable) {
      await member.roles.set([], 'Anti-nuke : trop d\'actions destructrices').catch(() => null);
    }

    await sendLog(
      client,
      baseEmbed(COLORS.danger)
        .setTitle('🚨 ANTI-NUKE DÉCLENCHÉ')
        .setDescription(
          `<@${executorId}> a effectué **${maxActions}+ actions destructrices** en ${getConfig('antinuke_interval_seconds')}s.\n` +
            (member?.manageable
              ? 'Tous ses rôles ont été **retirés**. @here vérifiez immédiatement !'
              : '⚠️ Impossible de retirer ses rôles (hiérarchie). @here intervenez manuellement !')
        )
    );
  }
}

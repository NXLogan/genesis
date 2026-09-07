import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Sanctions } from '../../db/index.js';
import { baseEmbed, COLORS, truncate } from '../utils.js';

export const data = new SlashCommandBuilder()
  .setName('sanctions')
  .setDescription("Voir l'historique des sanctions d'un membre")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) => opt.setName('membre').setDescription('Membre').setRequired(true));

const EMOJIS = { ban: '🔨', kick: '👢', mute: '🔇', unmute: '🔊', warn: '⚠️' };

export async function execute(interaction) {
  const user = interaction.options.getUser('membre');
  const sanctions = Sanctions.byUser(user.id);

  if (!sanctions.length) {
    return interaction.reply({
      content: `✅ Aucune sanction pour **${user.tag}**.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  const lines = sanctions
    .slice(0, 15)
    .map(
      (s) =>
        `${EMOJIS[s.type] ?? '❔'} **${s.type}** — ${s.reason || 'sans motif'}` +
        (s.duration ? ` (${s.duration})` : '') +
        ` · par \`${s.moderator_tag}\` · ${s.created_at}`
    )
    .join('\n');

  const embed = baseEmbed(COLORS.info)
    .setTitle(`📋 Sanctions de ${user.tag} (${sanctions.length})`)
    .setDescription(truncate(lines, 4000))
    .setThumbnail(user.displayAvatarURL());

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

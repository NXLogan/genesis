import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { getConfig } from '../../db/index.js';
import { baseEmbed, COLORS, sendLog } from '../utils.js';

/** Publie le panneau de règlement avec le bouton d'acceptation. */
export async function publishRulesPanel(channel) {
  const embed = baseEmbed(COLORS.primary)
    .setTitle('📜 Règlement du serveur')
    .setDescription(getConfig('rules_text'))
    .setFooter({ text: "Clique sur ✅ Accepter pour obtenir l'accès au serveur." });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('rules_accept')
      .setLabel('Accepter le règlement')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success)
  );

  return channel.send({ embeds: [embed], components: [row] });
}

/** Gère le clic sur le bouton "Accepter le règlement". */
export async function handleRulesAccept(interaction) {
  const roleId = getConfig('member_role_id');
  if (!roleId) {
    return interaction.reply({
      content: "⚠️ Le rôle membre n'est pas configuré. Un admin doit le définir via `/config` ou le panel web.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    return interaction.reply({
      content: '⚠️ Le rôle membre configuré est introuvable.',
      flags: MessageFlags.Ephemeral,
    });
  }

  if (interaction.member.roles.cache.has(roleId)) {
    return interaction.reply({
      content: '✅ Tu as déjà accepté le règlement.',
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.member.roles.add(role, 'Règlement accepté');
  await interaction.reply({
    content: `✅ Règlement accepté ! Le rôle ${role} t'a été attribué. Bienvenue !`,
    flags: MessageFlags.Ephemeral,
  });

  await sendLog(
    interaction.client,
    baseEmbed(COLORS.success)
      .setTitle('📜 Règlement accepté')
      .setDescription(`${interaction.user} (\`${interaction.user.tag}\`) a accepté le règlement.`)
  );
}

import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { applySanction } from '../features/moderation.js';

export const data = new SlashCommandBuilder()
  .setName('warn')
  .setDescription('Avertir un membre')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) => opt.setName('membre').setDescription('Membre à avertir').setRequired(true))
  .addStringOption((opt) =>
    opt.setName('motif').setDescription("Motif de l'avertissement").setRequired(true).setMaxLength(500)
  );

export async function execute(interaction) {
  const member = interaction.options.getMember('membre');
  const reason = interaction.options.getString('motif');

  if (!member) {
    return interaction.reply({ content: '⚠️ Membre introuvable.', flags: MessageFlags.Ephemeral });
  }
  if (member.user.bot) {
    return interaction.reply({ content: "⚠️ Impossible d'avertir un bot.", flags: MessageFlags.Ephemeral });
  }

  await interaction.deferReply();
  await applySanction({
    type: 'warn',
    user: member.user,
    moderator: interaction.user,
    reason,
    guild: interaction.guild,
    client: interaction.client,
  });

  await interaction.editReply({ content: `⚠️ **${member.user.tag}** a été averti. Motif : ${reason}` });
}

import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { applySanction } from '../features/moderation.js';

export const data = new SlashCommandBuilder()
  .setName('unmute')
  .setDescription("Retirer le mute d'un membre")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) => opt.setName('membre').setDescription('Membre').setRequired(true));

export async function execute(interaction) {
  const member = interaction.options.getMember('membre');

  if (!member) {
    return interaction.reply({ content: '⚠️ Membre introuvable.', flags: MessageFlags.Ephemeral });
  }
  if (!member.isCommunicationDisabled()) {
    return interaction.reply({ content: "⚠️ Ce membre n'est pas muet.", flags: MessageFlags.Ephemeral });
  }

  await interaction.deferReply();
  await member.timeout(null, `Unmute par ${interaction.user.tag}`);
  await applySanction({
    type: 'unmute',
    user: member.user,
    moderator: interaction.user,
    reason: 'Mute retiré',
    guild: interaction.guild,
    client: interaction.client,
  });

  await interaction.editReply({ content: `🔊 **${member.user.tag}** n'est plus muet.` });
}

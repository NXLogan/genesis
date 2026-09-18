import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { convoke } from '../features/convocations.js';

export const data = new SlashCommandBuilder()
  .setName('convoquer')
  .setDescription('Convoquer un membre (salon privé + MP)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) => opt.setName('membre').setDescription('Membre à convoquer').setRequired(true))
  .addStringOption((opt) =>
    opt.setName('motif').setDescription('Motif de la convocation').setRequired(true).setMaxLength(500)
  );

export async function execute(interaction) {
  const member = interaction.options.getMember('membre');
  const reason = interaction.options.getString('motif');

  if (!member) {
    return interaction.reply({ content: '⚠️ Membre introuvable.', flags: MessageFlags.Ephemeral });
  }
  if (member.user.bot) {
    return interaction.reply({ content: '⚠️ Impossible de convoquer un bot.', flags: MessageFlags.Ephemeral });
  }
  if (member.id === interaction.user.id) {
    return interaction.reply({ content: '⚠️ Tu ne peux pas te convoquer toi-même.', flags: MessageFlags.Ephemeral });
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const channel = await convoke(interaction, member, reason);
  await interaction.editReply({ content: `✅ ${member} convoqué dans ${channel}.` });
}

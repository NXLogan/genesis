import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { applySanction } from '../features/moderation.js';

export const data = new SlashCommandBuilder()
  .setName('kick')
  .setDescription('Expulser un membre')
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((opt) => opt.setName('membre').setDescription('Membre à expulser').setRequired(true))
  .addStringOption((opt) => opt.setName('motif').setDescription('Motif').setMaxLength(500));

export async function execute(interaction) {
  const member = interaction.options.getMember('membre');
  const reason = interaction.options.getString('motif') ?? 'Aucun motif fourni';

  if (!member) {
    return interaction.reply({ content: '⚠️ Membre introuvable.', flags: MessageFlags.Ephemeral });
  }
  if (!member.kickable) {
    return interaction.reply({
      content: '⛔ Je ne peux pas expulser ce membre (hiérarchie des rôles).',
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferReply();
  await applySanction({
    type: 'kick',
    user: member.user,
    moderator: interaction.user,
    reason,
    guild: interaction.guild,
    client: interaction.client,
  });
  await member.kick(`${reason} (par ${interaction.user.tag})`);

  await interaction.editReply({ content: `👢 **${member.user.tag}** a été expulsé. Motif : ${reason}` });
}

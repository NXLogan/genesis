import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { applySanction } from '../features/moderation.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bannir un membre')
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption((opt) => opt.setName('membre').setDescription('Membre à bannir').setRequired(true))
  .addStringOption((opt) => opt.setName('motif').setDescription('Motif').setMaxLength(500))
  .addIntegerOption((opt) =>
    opt
      .setName('supprimer-messages')
      .setDescription('Supprimer les messages des derniers jours (0-7)')
      .setMinValue(0)
      .setMaxValue(7)
  );

export async function execute(interaction) {
  const member = interaction.options.getMember('membre');
  const user = interaction.options.getUser('membre');
  const reason = interaction.options.getString('motif') ?? 'Aucun motif fourni';
  const deleteDays = interaction.options.getInteger('supprimer-messages') ?? 0;

  if (member && !member.bannable) {
    return interaction.reply({
      content: '⛔ Je ne peux pas bannir ce membre (hiérarchie des rôles).',
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferReply();
  await applySanction({
    type: 'ban',
    user,
    moderator: interaction.user,
    reason,
    guild: interaction.guild,
    client: interaction.client,
  });
  await interaction.guild.members.ban(user.id, {
    reason: `${reason} (par ${interaction.user.tag})`,
    deleteMessageSeconds: deleteDays * 86400,
  });

  await interaction.editReply({ content: `🔨 **${user.tag}** a été banni. Motif : ${reason}` });
}

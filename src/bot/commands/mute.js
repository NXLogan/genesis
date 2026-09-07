import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { applySanction } from '../features/moderation.js';

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Rendre muet un membre (timeout)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) => opt.setName('membre').setDescription('Membre à rendre muet').setRequired(true))
  .addIntegerOption((opt) =>
    opt
      .setName('duree')
      .setDescription('Durée en minutes (max 40320 = 28 jours)')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(40320)
  )
  .addStringOption((opt) => opt.setName('motif').setDescription('Motif').setMaxLength(500));

export async function execute(interaction) {
  const member = interaction.options.getMember('membre');
  const minutes = interaction.options.getInteger('duree');
  const reason = interaction.options.getString('motif') ?? 'Aucun motif fourni';

  if (!member) {
    return interaction.reply({ content: '⚠️ Membre introuvable.', flags: MessageFlags.Ephemeral });
  }
  if (!member.moderatable) {
    return interaction.reply({
      content: '⛔ Je ne peux pas rendre muet ce membre (hiérarchie des rôles).',
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferReply();
  await member.timeout(minutes * 60 * 1000, `${reason} (par ${interaction.user.tag})`);
  await applySanction({
    type: 'mute',
    user: member.user,
    moderator: interaction.user,
    reason,
    duration: `${minutes} min`,
    guild: interaction.guild,
    client: interaction.client,
  });

  await interaction.editReply({
    content: `🔇 **${member.user.tag}** est muet pendant **${minutes} min**. Motif : ${reason}`,
  });
}

import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('Définir le mode lent du salon')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addIntegerOption((opt) =>
    opt
      .setName('secondes')
      .setDescription('Délai entre chaque message (0 pour désactiver, max 21600)')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(21600)
  );

export async function execute(interaction) {
  const seconds = interaction.options.getInteger('secondes');
  await interaction.channel.setRateLimitPerUser(seconds, `Slowmode par ${interaction.user.tag}`);

  await interaction.reply({
    content:
      seconds === 0
        ? '🐇 Mode lent **désactivé** dans ce salon.'
        : `🐢 Mode lent défini à **${seconds}s** dans ce salon.`,
    flags: MessageFlags.Ephemeral,
  });
}

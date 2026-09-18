import { ChannelType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { publishTicketPanel } from '../features/tickets.js';

export const data = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('Gérer le système de tickets')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((sub) =>
    sub
      .setName('panneau')
      .setDescription("Publier le panneau d'ouverture de tickets")
      .addChannelOption((opt) =>
        opt
          .setName('salon')
          .setDescription('Salon où publier (par défaut : salon actuel)')
          .addChannelTypes(ChannelType.GuildText)
      )
  );

export async function execute(interaction) {
  const channel = interaction.options.getChannel('salon') ?? interaction.channel;
  await publishTicketPanel(channel);
  await interaction.reply({
    content: `✅ Panneau de tickets publié dans ${channel}.`,
    flags: MessageFlags.Ephemeral,
  });
}

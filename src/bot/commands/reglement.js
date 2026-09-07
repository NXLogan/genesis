import { ChannelType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { setConfig } from '../../db/index.js';
import { publishRulesPanel } from '../features/rules.js';

export const data = new SlashCommandBuilder()
  .setName('reglement')
  .setDescription('Gérer le règlement du serveur')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((sub) =>
    sub
      .setName('publier')
      .setDescription("Publier le règlement avec le bouton d'acceptation")
      .addChannelOption((opt) =>
        opt
          .setName('salon')
          .setDescription('Salon où publier (par défaut : salon actuel)')
          .addChannelTypes(ChannelType.GuildText)
      )
  );

export async function execute(interaction) {
  const channel = interaction.options.getChannel('salon') ?? interaction.channel;
  setConfig('rules_channel_id', channel.id);

  await publishRulesPanel(channel);
  await interaction.reply({
    content: `✅ Règlement publié dans ${channel}.`,
    flags: MessageFlags.Ephemeral,
  });
}

import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { baseEmbed, COLORS, sendLog } from '../utils.js';

export const data = new SlashCommandBuilder()
  .setName('unlock')
  .setDescription('Déverrouiller le salon')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
    SendMessages: null,
  });

  await interaction.reply({
    embeds: [baseEmbed(COLORS.success).setDescription(`🔓 Salon déverrouillé par ${interaction.user}.`)],
  });

  await sendLog(
    interaction.client,
    baseEmbed(COLORS.success)
      .setTitle('🔓 Salon déverrouillé')
      .setDescription(`**Salon :** ${interaction.channel}\n**Par :** ${interaction.user} (\`${interaction.user.tag}\`)`)
  );
}

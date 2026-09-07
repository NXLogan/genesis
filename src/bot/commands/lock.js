import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { baseEmbed, COLORS, sendLog } from '../utils.js';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Verrouiller le salon (personne ne peut écrire)')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
    SendMessages: false,
  });

  await interaction.reply({
    embeds: [baseEmbed(COLORS.danger).setDescription(`🔒 Salon verrouillé par ${interaction.user}.`)],
  });

  await sendLog(
    interaction.client,
    baseEmbed(COLORS.danger)
      .setTitle('🔒 Salon verrouillé')
      .setDescription(`**Salon :** ${interaction.channel}\n**Par :** ${interaction.user} (\`${interaction.user.tag}\`)`)
  );
}

import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { baseEmbed, COLORS, sendLog } from '../utils.js';

export const data = new SlashCommandBuilder()
  .setName('clear')
  .setDescription('Supprimer des messages en masse')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption((opt) =>
    opt.setName('nombre').setDescription('Nombre de messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
  )
  .addUserOption((opt) => opt.setName('membre').setDescription('Ne supprimer que les messages de ce membre'));

export async function execute(interaction) {
  const amount = interaction.options.getInteger('nombre');
  const user = interaction.options.getUser('membre');

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let messages = await interaction.channel.messages.fetch({ limit: 100 });
  if (user) messages = messages.filter((m) => m.author.id === user.id);
  const toDelete = [...messages.values()].slice(0, amount);

  const deleted = await interaction.channel.bulkDelete(toDelete, true);

  await interaction.editReply({
    content: `🧹 **${deleted.size}** message(s) supprimé(s)${user ? ` de **${user.tag}**` : ''}.`,
  });

  await sendLog(
    interaction.client,
    baseEmbed(COLORS.warning)
      .setTitle('🧹 Messages supprimés en masse')
      .setDescription(
        `**Salon :** ${interaction.channel}\n**Nombre :** ${deleted.size}\n**Par :** ${interaction.user} (\`${interaction.user.tag}\`)` +
          (user ? `\n**Cible :** ${user} (\`${user.tag}\`)` : '')
      )
  );
}

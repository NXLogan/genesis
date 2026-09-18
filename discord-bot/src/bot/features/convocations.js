import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import { Convocations, getConfig } from '../../db/index.js';
import { baseEmbed, COLORS, sendLog } from '../utils.js';

/** Convoque un membre : salon privé + MP + log en base. */
export async function convoke(interaction, member, reason) {
  const staffRoleId = getConfig('staff_role_id');
  const categoryId = getConfig('convocations_category_id');

  const convocationId = Convocations.create(
    member.id,
    member.user.tag,
    interaction.user.id,
    interaction.user.tag,
    reason
  );

  const permissionOverwrites = [
    { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
    {
      id: interaction.client.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    },
  ];
  if (staffRoleId && interaction.guild.roles.cache.has(staffRoleId)) {
    permissionOverwrites.push({
      id: staffRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    });
  }

  const channel = await interaction.guild.channels.create({
    name: `convocation-${member.user.username}`.slice(0, 100),
    type: ChannelType.GuildText,
    parent: categoryId || undefined,
    permissionOverwrites,
  });

  Convocations.setChannel(convocationId, channel.id);

  const embed = baseEmbed(COLORS.warning)
    .setTitle(`📣 Convocation #${convocationId}`)
    .setDescription(
      `${member}, tu as été convoqué(e) par le staff.\n\n**Motif :** ${reason}\n\nMerci de répondre ici dès que possible.`
    )
    .setFooter({ text: `Convoqué par ${interaction.user.tag}` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('convocation_close')
      .setLabel('Clore la convocation')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({ content: `${member}`, embeds: [embed], components: [row] });

  // MP au membre
  await member
    .send({
      embeds: [
        baseEmbed(COLORS.warning)
          .setTitle(`📣 Convocation sur ${interaction.guild.name}`)
          .setDescription(
            `Tu as été convoqué(e) par le staff.\n\n**Motif :** ${reason}\n\nRends-toi dans le salon ${channel} pour répondre.`
          ),
      ],
    })
    .catch(() => null);

  await sendLog(
    interaction.client,
    baseEmbed(COLORS.warning)
      .setTitle('📣 Convocation créée')
      .setDescription(
        `**Membre :** ${member} (\`${member.user.tag}\`)\n**Par :** ${interaction.user} (\`${interaction.user.tag}\`)\n**Motif :** ${reason}`
      )
  );

  return channel;
}

/** Clôt une convocation (bouton, réservé au staff). */
export async function closeConvocation(interaction) {
  const convocation = Convocations.byChannel(interaction.channel.id);
  if (!convocation) {
    return interaction.reply({
      content: "⚠️ Ce salon n'est pas une convocation ouverte.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const staffRoleId = getConfig('staff_role_id');
  const isStaff =
    interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
    (staffRoleId && interaction.member.roles.cache.has(staffRoleId));
  if (!isStaff) {
    return interaction.reply({
      content: '⛔ Seul le staff peut clore une convocation.',
      flags: MessageFlags.Ephemeral,
    });
  }

  Convocations.close(convocation.id);

  await interaction.reply({
    embeds: [
      baseEmbed(COLORS.success).setDescription(
        `✅ Convocation close par ${interaction.user}. Suppression du salon dans **5 secondes**.`
      ),
    ],
  });

  await sendLog(
    interaction.client,
    baseEmbed(COLORS.success)
      .setTitle('📣 Convocation close')
      .setDescription(
        `**Membre :** <@${convocation.user_id}> (\`${convocation.user_tag}\`)\n**Close par :** ${interaction.user} (\`${interaction.user.tag}\`)`
      )
  );

  setTimeout(() => {
    interaction.channel.delete('Convocation close').catch(() => null);
  }, 5000);
}

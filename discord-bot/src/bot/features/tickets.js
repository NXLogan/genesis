import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';
import { getConfig, Tickets } from '../../db/index.js';
import { baseEmbed, COLORS, sendLog, truncate } from '../utils.js';

export const TICKET_CATEGORIES = {
  support: { label: 'Support', emoji: '🛠️' },
  report: { label: 'Signalement', emoji: '🚨' },
  autre: { label: 'Autre', emoji: '💬' },
};

/** Publie le panneau d'ouverture de tickets. */
export async function publishTicketPanel(channel) {
  const embed = baseEmbed(COLORS.primary)
    .setTitle('🎫 Support — Ouvrir un ticket')
    .setDescription(
      'Besoin d\'aide ou envie de signaler quelque chose ?\n' +
        'Clique sur un bouton ci-dessous pour ouvrir un ticket privé avec le staff.\n\n' +
        '🛠️ **Support** — problème technique ou question\n' +
        '🚨 **Signalement** — signaler un membre ou un abus\n' +
        '💬 **Autre** — toute autre demande'
    );

  const row = new ActionRowBuilder().addComponents(
    ...Object.entries(TICKET_CATEGORIES).map(([key, cat]) =>
      new ButtonBuilder()
        .setCustomId(`ticket_open:${key}`)
        .setLabel(cat.label)
        .setEmoji(cat.emoji)
        .setStyle(ButtonStyle.Primary)
    )
  );

  return channel.send({ embeds: [embed], components: [row] });
}

/** Ouvre un ticket (clic sur un bouton du panneau). */
export async function openTicket(interaction, category) {
  const existing = Tickets.openByUser(interaction.user.id);
  if (existing && existing.channel_id) {
    const channel = interaction.guild.channels.cache.get(existing.channel_id);
    if (channel) {
      return interaction.reply({
        content: `⚠️ Tu as déjà un ticket ouvert : ${channel}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const categoryId = getConfig('tickets_category_id');
  const staffRoleId = getConfig('staff_role_id');

  const ticketId = Tickets.create(interaction.user.id, interaction.user.tag, category);

  const permissionOverwrites = [
    { id: interaction.guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: interaction.user.id,
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
    name: `ticket-${String(ticketId).padStart(4, '0')}`,
    type: ChannelType.GuildText,
    parent: categoryId || undefined,
    permissionOverwrites,
  });

  Tickets.setChannel(ticketId, channel.id);

  const cat = TICKET_CATEGORIES[category] ?? TICKET_CATEGORIES.autre;
  const embed = baseEmbed(COLORS.primary)
    .setTitle(`${cat.emoji} Ticket #${String(ticketId).padStart(4, '0')} — ${cat.label}`)
    .setDescription(
      `Bonjour ${interaction.user} !\n\n` +
        'Explique ta demande ici, le staff te répondra dès que possible.\n' +
        'Utilise les boutons ci-dessous pour gérer le ticket.'
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_claim')
      .setLabel('Prendre en charge')
      .setEmoji('🙋')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('Fermer')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger)
  );

  const mention = staffRoleId ? `<@&${staffRoleId}>` : '';
  await channel.send({ content: `${interaction.user} ${mention}`, embeds: [embed], components: [row] });

  await interaction.editReply({ content: `✅ Ton ticket a été créé : ${channel}` });

  await sendLog(
    interaction.client,
    baseEmbed(COLORS.info)
      .setTitle('🎫 Ticket ouvert')
      .setDescription(
        `**Ticket :** #${String(ticketId).padStart(4, '0')} (${cat.label})\n**Par :** ${interaction.user} (\`${interaction.user.tag}\`)`
      )
  );
}

/** Prise en charge d'un ticket par un membre du staff. */
export async function claimTicket(interaction) {
  const ticket = Tickets.byChannel(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: "⚠️ Ce salon n'est pas un ticket ouvert.", flags: MessageFlags.Ephemeral });
  }
  if (ticket.claimed_by) {
    return interaction.reply({
      content: `⚠️ Ce ticket est déjà pris en charge par <@${ticket.claimed_by}>.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  Tickets.claim(ticket.id, interaction.user.id, interaction.user.tag);
  await interaction.reply({
    embeds: [
      baseEmbed(COLORS.success).setDescription(`🙋 ${interaction.user} prend ce ticket en charge.`),
    ],
  });
}

/** Ferme un ticket : transcript en base, log, DM à l'auteur, suppression du salon. */
export async function closeTicket(interaction) {
  const ticket = Tickets.byChannel(interaction.channel.id);
  if (!ticket) {
    return interaction.reply({ content: "⚠️ Ce salon n'est pas un ticket ouvert.", flags: MessageFlags.Ephemeral });
  }

  await interaction.reply({
    embeds: [
      baseEmbed(COLORS.warning).setDescription(
        '🔒 Fermeture du ticket dans **5 secondes**... Le transcript est sauvegardé.'
      ),
    ],
  });

  Tickets.close(ticket.id, interaction.user.id, interaction.user.tag);

  const messages = Tickets.messages(ticket.id);
  const transcriptPreview = messages
    .slice(-10)
    .map((m) => `**${m.author_tag}** : ${m.content}`)
    .join('\n');

  await sendLog(
    interaction.client,
    baseEmbed(COLORS.danger)
      .setTitle('🔒 Ticket fermé')
      .setDescription(
        `**Ticket :** #${String(ticket.id).padStart(4, '0')} (${ticket.category})\n` +
          `**Auteur :** <@${ticket.user_id}> (\`${ticket.user_tag}\`)\n` +
          `**Fermé par :** ${interaction.user} (\`${interaction.user.tag}\`)\n` +
          `**Messages :** ${messages.length} — transcript complet disponible sur le panel web.`
      )
      .addFields(
        transcriptPreview
          ? [{ name: 'Derniers messages', value: truncate(transcriptPreview, 1024) }]
          : []
      )
  );

  // MP à l'auteur du ticket
  const user = await interaction.client.users.fetch(ticket.user_id).catch(() => null);
  if (user) {
    await user
      .send({
        embeds: [
          baseEmbed(COLORS.info).setDescription(
            `🔒 Ton ticket **#${String(ticket.id).padStart(4, '0')}** a été fermé par ${interaction.user.tag}. Merci de nous avoir contactés !`
          ),
        ],
      })
      .catch(() => null);
  }

  setTimeout(() => {
    interaction.channel.delete('Ticket fermé').catch(() => null);
  }, 5000);
}

/** Enregistre les messages d'un salon de ticket pour le transcript. */
export function recordTicketMessage(message) {
  if (!message.guild || message.author.bot) return;
  const ticket = Tickets.byChannel(message.channel.id);
  if (!ticket) return;
  Tickets.addMessage(ticket.id, message.author.id, message.author.tag, message.content || '[pièce jointe]');
}

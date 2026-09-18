import {
  ChannelType,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { getAllConfig, setConfig } from '../../db/index.js';
import { baseEmbed, COLORS } from '../utils.js';

export const data = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Configurer le bot (salons, rôles)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((sub) =>
    sub
      .setName('salon-logs')
      .setDescription('Définir le salon des logs')
      .addChannelOption((opt) =>
        opt.setName('salon').setDescription('Salon texte').addChannelTypes(ChannelType.GuildText).setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName('salon-github')
      .setDescription('Définir le salon des logs GitHub (commits)')
      .addChannelOption((opt) =>
        opt.setName('salon').setDescription('Salon texte').addChannelTypes(ChannelType.GuildText).setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName('salon-patchnotes')
      .setDescription('Définir le salon des patch notes')
      .addChannelOption((opt) =>
        opt.setName('salon').setDescription('Salon texte').addChannelTypes(ChannelType.GuildText).setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName('categorie-tickets')
      .setDescription('Définir la catégorie des tickets')
      .addChannelOption((opt) =>
        opt
          .setName('categorie')
          .setDescription('Catégorie')
          .addChannelTypes(ChannelType.GuildCategory)
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName('categorie-convocations')
      .setDescription('Définir la catégorie des convocations')
      .addChannelOption((opt) =>
        opt
          .setName('categorie')
          .setDescription('Catégorie')
          .addChannelTypes(ChannelType.GuildCategory)
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName('role-membre')
      .setDescription('Définir le rôle donné après acceptation du règlement')
      .addRoleOption((opt) => opt.setName('role').setDescription('Rôle membre').setRequired(true))
  )
  .addSubcommand((sub) =>
    sub
      .setName('role-staff')
      .setDescription('Définir le rôle staff (accès tickets/convocations)')
      .addRoleOption((opt) => opt.setName('role').setDescription('Rôle staff').setRequired(true))
  )
  .addSubcommand((sub) => sub.setName('voir').setDescription('Voir la configuration actuelle'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === 'voir') {
    const config = getAllConfig();
    const channel = (id) => (id ? `<#${id}>` : '❌ non défini');
    const role = (id) => (id ? `<@&${id}>` : '❌ non défini');

    const embed = baseEmbed(COLORS.info)
      .setTitle('⚙️ Configuration actuelle')
      .addFields(
        { name: 'Salon logs', value: channel(config.logs_channel_id), inline: true },
        { name: 'Salon GitHub', value: channel(config.github_logs_channel_id), inline: true },
        { name: 'Salon patch notes', value: channel(config.patchnotes_channel_id), inline: true },
        { name: 'Catégorie tickets', value: channel(config.tickets_category_id), inline: true },
        { name: 'Catégorie convocations', value: channel(config.convocations_category_id), inline: true },
        { name: 'Rôle membre', value: role(config.member_role_id), inline: true },
        { name: 'Rôle staff', value: role(config.staff_role_id), inline: true },
        {
          name: 'Sécurité',
          value:
            `Anti-spam : ${config.antispam_enabled ? '✅' : '❌'} · ` +
            `Anti-raid : ${config.antiraid_enabled ? '✅' : '❌'} · ` +
            `Anti-invite : ${config.antiinvite_enabled ? '✅' : '❌'} · ` +
            `Anti-nuke : ${config.antinuke_enabled ? '✅' : '❌'}\n` +
            '_Réglages détaillés disponibles sur le panel web._',
        }
      );
    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }

  const mapping = {
    'salon-logs': ['logs_channel_id', 'salon'],
    'salon-github': ['github_logs_channel_id', 'salon'],
    'salon-patchnotes': ['patchnotes_channel_id', 'salon'],
    'categorie-tickets': ['tickets_category_id', 'categorie'],
    'categorie-convocations': ['convocations_category_id', 'categorie'],
    'role-membre': ['member_role_id', 'role'],
    'role-staff': ['staff_role_id', 'role'],
  };

  const [key, optionName] = mapping[sub];
  const value =
    optionName === 'role'
      ? interaction.options.getRole(optionName)
      : interaction.options.getChannel(optionName);

  setConfig(key, value.id);

  // Pour le salon GitHub : crée (ou réutilise) un webhook Discord et affiche l'URL
  // à coller dans les secrets GitHub (DISCORD_GITHUB_WEBHOOK_URL).
  if (sub === 'salon-github' && value.isTextBased?.()) {
    try {
      const hooks = await value.fetchWebhooks();
      let hook = hooks.find((h) => h.name === 'GitHub Logs' && h.owner?.id === interaction.client.user.id);
      if (!hook) {
        hook = await value.createWebhook({
          name: 'GitHub Logs',
          avatar: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          reason: 'Logs de commits GitHub',
        });
      }
      return interaction.reply({
        content:
          `✅ Salon GitHub : ${value}\n\n` +
          `Colle cette URL comme secret GitHub **\`DISCORD_GITHUB_WEBHOOK_URL\`** ` +
          `(repo → Settings → Secrets and variables → Actions) :\n` +
          `||${hook.url}||\n\n` +
          `_L’Action \`.github/workflows/discord-commits.yml\` publiera chaque commit ici._`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      return interaction.reply({
        content:
          `✅ Salon GitHub enregistré : ${value}\n` +
          `⚠️ Impossible de créer le webhook Discord automatiquement (${err.message}). ` +
          `Crée-en un à la main dans le salon (Paramètres → Intégrations → Webhooks) ` +
          `et ajoute l’URL comme secret \`DISCORD_GITHUB_WEBHOOK_URL\`.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  }

  await interaction.reply({
    content: `✅ Configuration mise à jour : **${sub}** → ${value}`,
    flags: MessageFlags.Ephemeral,
  });
}

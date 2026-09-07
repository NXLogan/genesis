import { Router } from 'express';
import { ChannelType } from 'discord.js';
import {
  Convocations,
  DEFAULT_CONFIG,
  getAllConfig,
  PatchNotes,
  Sanctions,
  setConfig,
  Tickets,
} from '../db/index.js';
import { publishPatchNote } from '../bot/features/patchnotes.js';
import { publishRulesPanel } from '../bot/features/rules.js';
import { publishTicketPanel } from '../bot/features/tickets.js';
import { musicAvailable } from '../bot/features/music.js';

export function createApiRouter(client) {
  const router = Router();

  const getGuild = () => client.guilds.cache.get(process.env.GUILD_ID);

  // --- Stats (dashboard) ---
  router.get('/stats', async (req, res) => {
    const guild = getGuild();
    if (!guild) return res.status(500).json({ error: 'Serveur introuvable' });

    res.json({
      guild: {
        name: guild.name,
        icon: guild.iconURL({ size: 128 }),
        memberCount: guild.memberCount,
        boosts: guild.premiumSubscriptionCount,
        channels: guild.channels.cache.size,
        roles: guild.roles.cache.size,
      },
      openTickets: Tickets.countOpen(),
      totalTickets: Tickets.all().length,
      openConvocations: Convocations.all().filter((c) => c.status === 'open').length,
      recentSanctions: Sanctions.countRecent(7),
      totalPatchNotes: PatchNotes.all().length,
      musicOnline: musicAvailable(client),
    });
  });

  // --- Serveur : salons et rôles (pour les selects de config) ---
  router.get('/guild', (req, res) => {
    const guild = getGuild();
    if (!guild) return res.status(500).json({ error: 'Serveur introuvable' });

    const channels = guild.channels.cache
      .filter((c) => c.type === ChannelType.GuildText)
      .map((c) => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const categories = guild.channels.cache
      .filter((c) => c.type === ChannelType.GuildCategory)
      .map((c) => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const roles = guild.roles.cache
      .filter((r) => r.id !== guild.id && !r.managed)
      .map((r) => ({ id: r.id, name: r.name, color: r.hexColor }))
      .sort((a, b) => b.name.localeCompare(a.name));

    res.json({ channels, categories, roles });
  });

  // --- Configuration ---
  router.get('/config', (req, res) => {
    res.json(getAllConfig());
  });

  router.put('/config', (req, res) => {
    const allowedKeys = Object.keys(DEFAULT_CONFIG);
    const updates = Object.entries(req.body).filter(([key]) => allowedKeys.includes(key));
    for (const [key, value] of updates) setConfig(key, value);
    res.json({ ok: true, updated: updates.length, config: getAllConfig() });
  });

  // --- Tickets ---
  router.get('/tickets', (req, res) => {
    res.json(Tickets.all());
  });

  router.get('/tickets/:id', (req, res) => {
    const ticket = Tickets.byId(Number(req.params.id));
    if (!ticket) return res.status(404).json({ error: 'Ticket introuvable' });
    res.json({ ...ticket, messages: Tickets.messages(ticket.id) });
  });

  // --- Convocations ---
  router.get('/convocations', (req, res) => {
    res.json(Convocations.all());
  });

  // --- Patch notes ---
  router.get('/patchnotes', (req, res) => {
    res.json(PatchNotes.all());
  });

  router.post('/patchnotes', async (req, res) => {
    const { version, title, content } = req.body;
    if (!version || !title || !content) {
      return res.status(400).json({ error: 'version, title et content sont requis' });
    }
    const result = await publishPatchNote(client, {
      version,
      title,
      content,
      authorId: req.session.user.id,
      authorTag: req.session.user.username,
    });
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json({ ok: true, id: result.id });
  });

  // --- Sanctions ---
  router.get('/sanctions', (req, res) => {
    res.json(Sanctions.all());
  });

  // --- Publication des panneaux depuis le panel ---
  router.post('/publish/rules', async (req, res) => {
    const { channelId } = req.body;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased()) return res.status(400).json({ error: 'Salon invalide' });
    setConfig('rules_channel_id', channelId);
    await publishRulesPanel(channel);
    res.json({ ok: true });
  });

  router.post('/publish/ticket-panel', async (req, res) => {
    const { channelId } = req.body;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased()) return res.status(400).json({ error: 'Salon invalide' });
    await publishTicketPanel(channel);
    res.json({ ok: true });
  });

  return router;
}

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

  const getGuild = () => {
    if (!client?.guilds || !process.env.GUILD_ID) return null;
    return client.guilds.cache.get(process.env.GUILD_ID) ?? null;
  };

  router.get('/me', (_req, res) => {
    res.json({ id: 'local', username: 'Admin', globalName: 'Admin local', avatar: null });
  });

  router.get('/stats', async (_req, res) => {
    const guild = getGuild();
    res.json({
      guild: guild
        ? {
            name: guild.name,
            icon: guild.iconURL({ size: 128 }),
            memberCount: guild.memberCount,
            boosts: guild.premiumSubscriptionCount,
            channels: guild.channels.cache.size,
            roles: guild.roles.cache.size,
          }
        : {
            name: 'Bot hors ligne',
            icon: null,
            memberCount: 0,
            boosts: 0,
            channels: 0,
            roles: 0,
          },
      openTickets: Tickets.countOpen(),
      totalTickets: Tickets.all().length,
      openConvocations: Convocations.all().filter((c) => c.status === 'open').length,
      recentSanctions: Sanctions.countRecent(7),
      totalPatchNotes: PatchNotes.all().length,
      musicOnline: client ? musicAvailable(client) : false,
    });
  });

  router.get('/guild', (_req, res) => {
    const guild = getGuild();
    if (!guild) {
      return res.json({ channels: [], categories: [], roles: [] });
    }

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

  router.get('/config', (_req, res) => {
    res.json(getAllConfig());
  });

  router.put('/config', (req, res) => {
    const allowedKeys = Object.keys(DEFAULT_CONFIG);
    const updates = Object.entries(req.body).filter(([key]) => allowedKeys.includes(key));
    for (const [key, value] of updates) setConfig(key, value);
    res.json({ ok: true, updated: updates.length, config: getAllConfig() });
  });

  router.get('/tickets', (_req, res) => {
    res.json(Tickets.all());
  });

  router.get('/tickets/:id', (req, res) => {
    const ticket = Tickets.byId(Number(req.params.id));
    if (!ticket) return res.status(404).json({ error: 'Ticket introuvable' });
    res.json({ ...ticket, messages: Tickets.messages(ticket.id) });
  });

  router.get('/convocations', (_req, res) => {
    res.json(Convocations.all());
  });

  router.get('/patchnotes', (_req, res) => {
    res.json(PatchNotes.all());
  });

  router.post('/patchnotes', async (req, res) => {
    if (!client) {
      return res.status(503).json({ error: 'Le bot Discord n\'est pas connecté.' });
    }
    const { version, title, content } = req.body;
    if (!version || !title || !content) {
      return res.status(400).json({ error: 'version, title et content sont requis' });
    }
    const result = await publishPatchNote(client, {
      version,
      title,
      content,
      authorId: 'local',
      authorTag: 'Admin local',
    });
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json({ ok: true, id: result.id });
  });

  router.get('/sanctions', (_req, res) => {
    res.json(Sanctions.all());
  });

  router.post('/publish/rules', async (req, res) => {
    if (!client) {
      return res.status(503).json({ error: 'Le bot Discord n\'est pas connecté.' });
    }
    const { channelId } = req.body;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased()) return res.status(400).json({ error: 'Salon invalide' });
    setConfig('rules_channel_id', channelId);
    await publishRulesPanel(channel);
    res.json({ ok: true });
  });

  router.post('/publish/ticket-panel', async (req, res) => {
    if (!client) {
      return res.status(503).json({ error: 'Le bot Discord n\'est pas connecté.' });
    }
    const { channelId } = req.body;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel?.isTextBased()) return res.status(400).json({ error: 'Salon invalide' });
    await publishTicketPanel(channel);
    res.json({ ok: true });
  });

  return router;
}

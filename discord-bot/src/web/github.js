import { createHmac, timingSafeEqual } from 'node:crypto';
import { Router } from 'express';
import { getConfig } from '../db/index.js';
import { baseEmbed, COLORS, truncate } from '../bot/utils.js';

const GITHUB_COLOR = 0x24292f;

function verifySignature(rawBody, signature, secret) {
  if (!secret || !signature?.startsWith('sha256=')) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const received = signature.slice('sha256='.length);
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
  } catch {
    return false;
  }
}

function formatCommitLine(commit) {
  const sha = commit.id.slice(0, 7);
  const msg = truncate(commit.message.split('\n')[0], 80);
  const author = commit.author?.username || commit.author?.name || 'inconnu';
  return `[\`${sha}\`](${commit.url}) ${msg} — *${author}*`;
}

/** Construit les embeds Discord à partir d'un événement push GitHub. */
export function buildPushEmbeds(payload) {
  const commits = payload.commits || [];
  if (!commits.length && !payload.head_commit) return [];

  const repo = payload.repository?.full_name || 'repo';
  const branch = (payload.ref || '').replace(/^refs\/heads\//, '') || 'unknown';
  const pusher = payload.pusher?.name || payload.sender?.login || 'quelqu’un';
  const compareUrl = payload.compare;
  const list = commits.length ? commits : payload.head_commit ? [payload.head_commit] : [];

  const lines = list.slice(-10).map(formatCommitLine);
  const extra = list.length > 10 ? `\n_… et ${list.length - 10} autre(s) commit(s)_` : '';

  const embed = baseEmbed(GITHUB_COLOR)
    .setAuthor({
      name: 'GitHub',
      iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      url: payload.repository?.html_url,
    })
    .setTitle(
      list.length === 1
        ? `Nouveau commit sur \`${repo}\``
        : `${list.length} commits sur \`${repo}\``
    )
    .setDescription(lines.join('\n') + extra)
    .addFields(
      { name: 'Branche', value: `\`${branch}\``, inline: true },
      { name: 'Auteur push', value: pusher, inline: true }
    )
    .setFooter({ text: repo });

  if (compareUrl) {
    embed.setURL(compareUrl);
  } else if (list[0]?.url) {
    embed.setURL(list[list.length - 1].url);
  }

  if (payload.forced) {
    embed.setColor(COLORS.danger).addFields({
      name: '⚠️ Force push',
      value: 'L’historique de la branche a été réécrit.',
    });
  }

  return [embed];
}

export async function sendGithubLog(client, embeds) {
  const channelId = getConfig('github_logs_channel_id');
  if (!channelId || !client || !embeds?.length) return false;

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased()) return false;

  await channel.send({ embeds });
  return true;
}

/**
 * Webhook GitHub (événements `push`).
 * À monter avec `express.raw({ type: 'application/json' })` pour vérifier la signature.
 */
export function createGithubWebhookRouter(client) {
  const router = Router();

  router.post('/', async (req, res) => {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    const signature = req.headers['x-hub-signature-256'];
    const event = req.headers['x-github-event'];
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');

    if (secret && !verifySignature(rawBody, signature, secret)) {
      return res.status(401).json({ error: 'Signature invalide' });
    }

    if (event === 'ping') {
      return res.json({ ok: true, message: 'pong' });
    }

    if (event !== 'push') {
      return res.status(204).end();
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'JSON invalide' });
    }

    // Ignore les tags / refs non-branches
    if (payload.ref && !payload.ref.startsWith('refs/heads/')) {
      return res.status(204).end();
    }

    if (!getConfig('github_logs_channel_id')) {
      return res.status(503).json({ error: 'Salon GitHub non configuré (github_logs_channel_id)' });
    }

    if (!client) {
      return res.status(503).json({ error: 'Bot Discord hors ligne' });
    }

    try {
      const embeds = buildPushEmbeds(payload);
      if (!embeds.length) return res.status(204).end();
      await sendGithubLog(client, embeds);
      res.json({ ok: true, commits: payload.commits?.length || 0 });
    } catch (err) {
      console.error('Erreur webhook GitHub :', err.message);
      res.status(500).json({ error: 'Échec envoi Discord' });
    }
  });

  return router;
}

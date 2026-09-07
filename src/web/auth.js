import { Router } from 'express';
import { PermissionFlagsBits } from 'discord.js';

const DISCORD_API = 'https://discord.com/api/v10';

function redirectUri() {
  return `${process.env.PANEL_URL || 'http://localhost:3000'}/auth/callback`;
}

/** Vérifie qu'un utilisateur est admin sur le serveur configuré. */
export async function isGuildAdmin(client, userId) {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return false;
  const member = await guild.members.fetch(userId).catch(() => null);
  return member?.permissions.has(PermissionFlagsBits.Administrator) ?? false;
}

export function createAuthRouter(client) {
  const router = Router();

  router.get('/login', (req, res) => {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      redirect_uri: redirectUri(),
      response_type: 'code',
      scope: 'identify',
      prompt: 'none',
    });
    res.redirect(`${DISCORD_API}/oauth2/authorize?${params}`);
  });

  router.get('/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect('/?error=no_code');

    try {
      // Échange du code contre un token
      const tokenResponse = await fetch(`${DISCORD_API}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri(),
        }),
      });
      if (!tokenResponse.ok) throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      const tokens = await tokenResponse.json();

      // Récupération de l'utilisateur
      const userResponse = await fetch(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!userResponse.ok) throw new Error(`User fetch failed: ${userResponse.status}`);
      const user = await userResponse.json();

      // Vérification admin
      const admin = await isGuildAdmin(client, user.id);
      if (!admin) {
        return res.redirect('/?error=not_admin');
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        globalName: user.global_name,
        avatar: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
          : null,
      };
      res.redirect('/');
    } catch (error) {
      console.error('Erreur OAuth2 :', error.message);
      res.redirect('/?error=oauth_failed');
    }
  });

  router.post('/logout', (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  return router;
}

/** Middleware : réservé aux admins connectés (re-vérifie le statut admin à chaque requête). */
export function requireAdmin(client) {
  return async (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Non connecté' });
    }
    const admin = await isGuildAdmin(client, req.session.user.id);
    if (!admin) {
      req.session.destroy(() => {});
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
  };
}

import express from 'express';
import session from 'express-session';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAuthRouter, requireAdmin } from './auth.js';
import { createApiRouter } from './api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function startWebServer(client) {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'change-moi',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      },
    })
  );

  // Auth OAuth2 Discord
  app.use('/auth', createAuthRouter(client));

  // Session (publique) — permet au panel de savoir si l'utilisateur est connecté
  app.get('/api/me', (req, res) => {
    res.json(req.session.user ?? null);
  });

  // API (protégée admin)
  app.use('/api', requireAdmin(client), createApiRouter(client));

  // Panel buildé (production)
  const distDir = join(__dirname, '../../panel/dist');
  if (existsSync(distDir)) {
    app.use(express.static(distDir));
    // Fallback SPA (toutes les routes non-API renvoient index.html)
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/auth')) {
        return next();
      }
      res.sendFile(join(distDir, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.send(
        '<h1>Panel non buildé</h1><p>Lance <code>npm run panel:build</code> pour construire le panel, ou <code>npm run panel:dev</code> pour le mode développement.</p>'
      );
    });
  }

  app.listen(port, () => {
    console.log(`🌐 Panel web : http://localhost:${port}`);
  });

  return app;
}

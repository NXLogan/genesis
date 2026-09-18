import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiRouter } from './api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function startWebServer(client = null) {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());

  // API ouverte (pas d'auth Discord)
  app.use('/api', createApiRouter(client));

  // Panel buildé (production)
  const distDir = join(__dirname, '../../../website/dist');
  if (existsSync(distDir)) {
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(join(distDir, 'index.html'));
    });
  } else {
    app.get('/', (req, res) => {
      res.send(
        '<h1>Panel non buildé</h1><p>Lance <code>npm run panel:build</code> à la racine pour construire le site.</p>'
      );
    });
  }

  app.listen(port, () => {
    console.log(`🌐 Panel web : http://localhost:${port}`);
  });

  return app;
}

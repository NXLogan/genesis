# 🎮 Projet GTA6

Monorepo : site web (panel), bot Discord, et emplacements pour le code in-game.

## Structure

```
website/          # Front React (Vite + Tailwind) — panel d'admin
discord-bot/      # Bot Discord + API Express + Lavalink + SQLite
in-game/          # Scripts / ressources liés au jeu
other/            # Divers (docs annexes, assets, outils)
```

## Fonctionnalités (bot + panel)

| Fonctionnalité | Description |
|---|---|
| 👋 **Bienvenue** | MP automatique (personnalisable) à chaque arrivée |
| 📜 **Règlement** | Embed + bouton d'acceptation qui donne le rôle membre |
| 🛠️ **Patch Notes** | `/patchnote` (formulaire) ou depuis le panel web, avec historique |
| 🎫 **Tickets** | Panneau à boutons (support / signalement / autre), salons privés, claim, fermeture, transcripts |
| 📣 **Convocations** | `/convoquer @membre motif` : MP + salon privé staff/membre |
| 📊 **Dashboard** | Panel web : stats, config, tickets, convocations, patch notes, sanctions, sécurité |
| 🎵 **Musique** | Lavalink : `/play`, `/skip`, `/stop`, `/pause`, `/queue`, `/volume`, `/nowplaying` + boutons |
| 🛡️ **Gestion** | `/ban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/sanctions`, `/clear`, `/slowmode`, `/lock`, `/unlock` |
| 🔒 **Sécurité** | Anti-spam, anti-raid, anti-invitations, anti-nuke, logs complets |
| 📦 **Logs GitHub** | Embed Discord à chaque push (Action + salon configurable) |

## 1. Créer le bot sur Discord

1. Va sur le [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**.
2. Onglet **Bot** :
   - **Reset Token** → copie le token (`DISCORD_TOKEN`).
   - Active les 3 intents : **Presence**, **Server Members**, **Message Content**.
3. Onglet **General Information** : copie l'**Application ID** (`DISCORD_CLIENT_ID`).
4. Onglet **OAuth2** :
   - Copie le **Client Secret** (`DISCORD_CLIENT_SECRET`).
   - Dans **Redirects**, ajoute : `http://localhost:3000/auth/callback`.
5. Invite le bot sur ton serveur : onglet **OAuth2 → URL Generator**, coche `bot` + `applications.commands`, permissions **Administrator**, ouvre l'URL générée.
6. Active le **mode développeur** dans Discord (Paramètres → Avancés), clic droit sur ton serveur → **Copier l'identifiant** (`GUILD_ID`).

## 2. Installer et lancer

```bash
# 1. Dépendances (bot + site)
npm run install:all

# 2. Configuration
cp discord-bot/.env.example discord-bot/.env
# → remplis DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, GUILD_ID

# 3. Déployer les commandes slash sur ton serveur
npm run deploy

# 4. Builder le site web
npm run panel:build

# 5. Lancer le bot + API (sert aussi le site buildé)
npm start
```

Le panel est sur **http://localhost:3000**.

## 3. Musique (optionnel)

La musique nécessite **Java 17+** et Lavalink :

```bash
# Installer Java sur macOS (si nécessaire)
brew install --cask temurin

# Lancer Lavalink (télécharge le .jar au premier lancement)
npm run lavalink
```

Laisse Lavalink tourner dans un terminal séparé. Le bot s'y reconnecte automatiquement.

## 4. Configuration initiale

Une fois le bot lancé, sur le panel web (**Configuration**) ou avec `/config` sur Discord :

1. Définis le **salon des logs**, le **salon des patch notes**, les **catégories tickets/convocations**.
2. Définis le **rôle membre** (donné à l'acceptation du règlement) et le **rôle staff**.
3. Publie le **règlement** (`/reglement publier` ou depuis le panel).
4. Publie le **panneau de tickets** (`/ticket panneau` ou depuis le panel).

> 💡 Pour verrouiller le serveur aux non-membres : retire la permission « Voir les salons » de `@everyone` sur tes salons, et donne-la au rôle membre.

## Logs GitHub → Discord

À chaque push, les commits sont annoncés dans un salon Discord.

### Setup rapide (recommandé)

1. Sur Discord : `/config salon-github #ton-salon`  
   → le bot crée un webhook et t’affiche l’URL (éphémère).
2. Sur GitHub (repo → **Settings → Secrets and variables → Actions**) :  
   crée le secret **`DISCORD_GITHUB_WEBHOOK_URL`** avec cette URL.
3. Push un commit : l’Action `.github/workflows/discord-commits.yml` poste l’embed.

### Alternative : webhook vers le bot

Si ton panel est public (`PANEL_URL`) :

1. Configure le salon (`/config salon-github` ou panel → **Salon logs GitHub**).
2. Dans `discord-bot/.env` : `GITHUB_WEBHOOK_SECRET=<openssl rand -hex 32>`.
3. GitHub → **Settings → Webhooks → Add webhook** :
   - Payload URL : `https://ton-domaine/webhooks/github`
   - Content type : `application/json`
   - Secret : la même valeur que `GITHUB_WEBHOOK_SECRET`
   - Events : **Just the push event**

## Développement

```bash
npm run dev          # bot + API avec rechargement auto
npm run panel:dev    # site Vite en mode dev (http://localhost:5173, proxy vers l'API)
```

## Détail `discord-bot/`

```
discord-bot/
  src/
    index.js            # Point d'entrée (bot + serveur web)
    deploy-commands.js  # Déploiement des commandes slash
    db/                 # SQLite (config, tickets, convocations, patchnotes, sanctions)
    bot/
      client.js         # Client discord.js + chargeurs
      commands/         # Commandes slash
      events/           # Événements Discord
      features/         # Logique métier (tickets, sécurité, musique...)
    web/
      server.js         # Serveur Express
      auth.js           # OAuth2 Discord + contrôle admin
      api.js            # API REST du panel
  lavalink/             # Serveur de musique (config + script)
  data/                 # Base SQLite (créée automatiquement)
```

# Genesis

Framework roleplay FiveM. Le préfixe technique est `gns` (ressources `gns_*`). Le nom visible est **Genesis**.

Genesis reprend la base **Qbox** (elle-même issue de QBCore et d’ESX), sous **GPL-3.0**. Les fichiers `LICENSE` d’origine sont conservés. Ce n’est pas un moteur réécrit de zéro : c’est cette base, renommée, avec un cœur durci.

## Lire dans cet ordre

1. [Démarrage](demarrage.md) — lancer le serveur, base de données, convars.
2. [Architecture](architecture.md) — qui fait quoi, et comment les noms s’emboîtent.
3. [Sécurité](securite.md) — ce que le cœur refuse, et ce qui reste à surveiller.
4. [Ajouter une ressource](creer-une-ressource.md) — le chemin pour un script maison.

## Carte rapide

| Dossier | Rôle |
|---|---|
| `resources/[gns]/gns_core` | Joueurs, argent, jobs, gangs, personnages |
| `resources/[gns]/gns_*` | Jobs, police, médical, garages, braquages |
| `resources/[ox]` | Inventaire, target, portes, MySQL, lib |
| `resources/[voice]` | Voix proximité et radio |
| `resources/[npwd]` | Téléphone |
| `server.cfg` | Ordre de démarrage et convars `gns:*` |

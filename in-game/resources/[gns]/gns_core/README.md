# gns_core

Cœur du framework Genesis (joueurs, argent, jobs, gangs, personnages).

La doc du serveur est dans [in-game/docs](../../../docs/README.md) : démarrage, architecture, sécurité, ajout d’une ressource.

Les scripts neufs passent par `exports.gns_core`. Le pont `qb-core` reste là pour Ox, l’inventaire et les ressources QB. Il se coupe avec `set gns:enableBridge "false"`.

## Dépendances

- oxmysql
- ox_lib
- ox_inventory

Base Qbox, GPL-3.0. Le fichier `LICENSE` d’origine est conservé.

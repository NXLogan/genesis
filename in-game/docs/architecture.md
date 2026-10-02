# Architecture

## Nom

| Avant | Genesis |
|---|---|
| Ressource `qbx_core` | `gns_core` |
| Dossier `resources/[qbx]` | `resources/[gns]` |
| Global Lua `QBX` | `GNS` |
| Lib `qbx.math`, `qbx.string` | `gns.math`, `gns.string` |
| Événements `qbx_core:*` | `gns_core:*` |
| Convars `qbx:*` | `gns:*` |
| Marque Qbox | Genesis |

`qb-core` et les événements `QBCore:*` ne sont pas renommés. C’est le pont qui fait tourner l’inventaire Ox, l’apparence, la banque et la plupart des scripts QB.

`gns_core` déclare aussi `provide 'qbx_core'`. Un script qui appelle encore `exports.qbx_core` est servi par Genesis. En plus, chaque événement `gns_core:*` est recopié en `qbx_core:*`.

Le téléphone NPWD ne connaît que l’identifiant interne `"qbx"`. `server.cfg` garde donc `set npwd:framework "qbx"`. Le pont, lui, s’appelle `gns_npwd`.

## Démarrage

`server.cfg` lance dans cet ordre :

1. `ox_lib`
2. `gns_core`
3. `ox_target`, puis le groupe `[ox]` (inventaire, portes, fuel, mysql)
4. le groupe `[gns]` (tous les jobs)
5. standalone, voix, assets
6. `gns_npwd` puis `npwd`

`inventory:framework` vaut `gns` (`ox.cfg`). L’inventaire charge `ox_inventory/modules/bridge/gns`.

## Cœur

`gns_core` est la seule ressource qui possède l’état joueur.

- `GNS.Players[source]` : joueur en ligne.
- `GNS.PlayerRegistry` : recherche en O(1) par citizenid, userId ou license. Pas de boucle sur tous les joueurs à chaque getter.
- L’argent, le job, le gang et les metadata passent par des exports serveur (`AddMoney`, `SetJob`, `SetMetadata`, …).
- La faim, la soif et le stress sont des metadata. Le state bag n’est qu’une copie envoyée au client pour le HUD.
- Les boucles (faim, salaire) traitent les joueurs par paquets de 20, avec un `Wait(0)` entre les paquets, pour ne pas figer le tick.

`modules/lib.lua` est inclus par les autres ressources (`@gns_core/modules/lib.lua`). Il expose `gns` et les wrappers de convars / événements.

`modules/guard.lua` est serveur uniquement. Il limite le nombre d’appels d’un net event par joueur. Voir [Sécurité](securite.md).

## Données

Les tables ne portent pas le préfixe `gns`. Elles restent celles de Qbox, parce que l’inventaire et le téléphone les connaissent déjà :

- `players`, `player_groups`, `player_vehicles`, `bans`
- `ox_inventory` pour les coffres
- tables `npwd_*` pour le téléphone

Les fichiers `.sql` sont à côté de chaque ressource (`gns_core.sql`, etc.). `genesis.sql` à la racine est le schéma de base de la recette.

## Pont QB

`bridge/qb` ne se charge que si `gns:enableBridge` n’est pas `false`. Il expose l’objet historique `qb-core` (`GetCoreObject`, callbacks, duty, commandes). Les scripts neufs doivent appeler `exports.gns_core`, pas ce pont.

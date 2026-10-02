# Démarrage

`in-game` est le dossier data d’un serveur FiveM (celui que txAdmin appelle la base du serveur).

## Prérequis

- Artifacts FiveM récents (le core demande le serveur `10731` ou plus)
- OneSync Infinity (`+set onesync on`)
- MySQL ou MariaDB
- Une clé de licence `sv_licenseKey`

`server.cfg` contient encore les marqueurs txAdmin : `{{svLicense}}`, `{{serverName}}`, `{{dbConnectionString}}`, `{{addPrincipalsMaster}}`. Soit tu passes par txAdmin, soit tu les remplaces à la main.

## Base

1. Crée une base vide.
2. Exécute `genesis.sql`.
3. Exécute les SQL des ressources qui en ont un : `resources/[gns]/gns_core/gns_core.sql`, `gns_vehicles/vehicles.sql`, et les autres `*.sql` sous `[gns]` et `[npwd]`.
4. Mets la chaîne de connexion dans `server.cfg` :

```cfg
set mysql_connection_string "mysql://user:pass@localhost/genesis?charset=utf8mb4"
```

`gns_core` déclare `oxmysql` en dépendance : FiveM le démarre avant le core, même si `ensure [ox]` est plus bas dans `server.cfg`.

## Langue

Déjà réglé pour le français :

- `sets locale "fr-FR"`
- `setr qb_locale "fr"` (textes Genesis / jobs)
- `setr ox:locale "fr"`
- `setr illenium-appearance:locale "fr"`

## Convars utiles

| Convar | Défaut | Effet |
|---|---|---|
| `gns:enableBridge` | `true` | Pont `qb-core` |
| `gns:enableQueue` | `true` | File d’attente du core |
| `gns:max_jobs_per_player` | `1` | Nombre de jobs |
| `gns:max_gangs_per_player` | `1` | Nombre de gangs |
| `gns:motd` | message d’accueil | HTML affiché au join |
| `inventory:framework` | `gns` | Pont d’inventaire |

Si une convar `gns:*` est absente, le core relit l’ancienne `qbx:*`.

## Lancer

Depuis le dossier `in-game` :

```bash
/chemin/vers/FXServer +exec server.cfg
```

Ou pointe txAdmin vers ce dossier.

Le premier joueur n’a pas d’ace admin tant que `permissions.cfg` n’a pas ton identifiant. txAdmin injecte en général le principal via `{{addPrincipalsMaster}}`. Sans ça, ajoute par exemple :

```cfg
add_principal identifier.license:TA_LICENSE group.admin
```

# Sécurité

Le client FiveM n’est pas un environnement fiable. Tout ce qui change l’argent, un job, un item ou un personnage doit être décidé sur le serveur.

## Ce que le cœur refuse

**Faim, soif, stress.** Un client peut écrire dans son propre state bag. Le handler serveur ignore ces écritures (`replicated == true`). La boucle de besoins lit `PlayerData.metadata`, pas le state bag. La sauvegarde ne recopie plus ces trois valeurs depuis le state bag. Un cheat qui met la faim à 100 ne tient pas jusqu’au prochain tick serveur : `SetMetadata` réécrit le state bag avec la valeur serveur.

**Suppression de personnage.** `DeleteCharacter` n’accepte qu’un citizenid alphanumérique, vérifie que la license du joueur possède ce personnage, et coupe au-delà de 3 essais en 30 secondes. Un citizenid qui n’appartient pas au joueur le fait expulser, comme avant.

**Duty, ouverture et fermeture du serveur, callback de login.** Limités par `GNS.Guard` (quelques appels par fenêtre de 10 secondes). Fermer le serveur exige l’ace `admin`, et le motif est tronqué à 180 caractères.

**`QBCore:CallCommand`.** Le nom de commande doit être un identifiant (`[%w_%-]+`). Les arguments ne peuvent pas contenir de retour à la ligne ni de `;`. L’ace `command.<nom>` est toujours exigée. Au-delà de 6 appels en 5 secondes, l’appel est ignoré.

**Véhicule persistant.** Le spawn réseau est limité, et les coordonnées doivent encore correspondre au cache serveur. Un client ne choisit pas un point arbitraire.

**Déconnexion.** La sauvegarde est dans un `pcall`. Si MySQL échoue, le joueur est quand même retiré de `GNS.Players`, au lieu de rester fantôme en mémoire.

## Argent et items

Il n’y a pas d’event réseau « donne-moi de l’argent ». `AddMoney` / `RemoveMoney` / `SetMoney` sont des fonctions serveur. L’inventaire Ox synchronise les comptes (`money`, etc.) depuis son propre serveur, pas depuis le client.

`SetMetadata` rejette les nombres non finis (NaN, inf) et borne faim, soif et stress entre 0 et 100.

## Rate limit

Dans `gns_core` :

```lua
if not GNS.Guard.allow(source, 'monAction', 5, 10000) then return end
```

Depuis une autre ressource :

```lua
if not exports.gns_core:GuardAllow(source, 'monAction', 5, 10000) then return end
```

5 appels maximum par joueur sur 10 secondes pour la clé `monAction`. Le compteur de ce joueur est effacé à la déconnexion.

## Ce qui n’est pas couvert

La santé et l’armure du ped restent lues sur l’entité au moment de la sauvegarde. Sur GTA, le client a la main sur son ped : ce n’est pas une autorité serveur complète.

Les jobs (`gns_police`, braquages, courses, etc.) ont leurs propres net events. Le renommage ne les audite pas un par un. Avant une ouverture publique, chaque event qui paie, donne un item ou téléporte doit vérifier la distance, le job et un rate limit. Le modèle à copier est celui du cœur : le client demande, le serveur décide.

Les ace de `permissions.cfg` donnent toutes les commandes à `group.admin`. À resserrer selon l’équipe.

## Compatibilité et surface d’attaque

`provide 'qbx_core'` et la copie des événements `qbx_core:*` existent pour que Ox et les scripts QB démarrent. Ils ne rajoutent pas de nouvelle action : ce sont les mêmes handlers. Désactiver le pont QB (`set gns:enableBridge "false"`) retire l’objet `qb-core`, pas les événements `gns_core:*`.

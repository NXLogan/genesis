# Sécurité

Le client FiveM n’est pas un environnement fiable. Tout ce qui change l’argent, un job, un item ou un personnage doit être décidé sur le serveur.

## Ce que le cœur refuse

**Faim, soif, stress.** Un client peut écrire dans son propre state bag. Le handler serveur ignore ces écritures (`replicated == true`). La boucle de besoins lit `PlayerData.metadata`, pas le state bag. La sauvegarde ne recopie plus ces trois valeurs depuis le state bag. Un cheat qui met la faim à 100 ne tient pas jusqu’au prochain tick serveur : `SetMetadata` réécrit le state bag avec la valeur serveur.

**Suppression de personnage.** `DeleteCharacter` n’accepte qu’un citizenid alphanumérique, vérifie que la license du joueur possède ce personnage, et coupe au-delà de 3 essais en 30 secondes. Un citizenid qui n’appartient pas au joueur le fait expulser, comme avant.

**Duty, ouverture et fermeture du serveur, callback de login.** Limités par `GNS.Guard` (quelques appels par fenêtre de 10 secondes). Fermer le serveur exige l’ace `admin`, et le motif est tronqué à 180 caractères.

**`QBCore:CallCommand`.** Le nom de commande doit être un identifiant (`[%w_%-]+`). Les arguments ne peuvent pas contenir de retour à la ligne ni de `;`. L’ace `command.<nom>` est toujours exigée. Au-delà de 6 appels en 5 secondes, l’appel est ignoré.

**Véhicule persistant.** Le spawn réseau est limité, et les coordonnées doivent encore correspondre au cache serveur. Un client ne choisit pas un point arbitraire. L’essence et l’huile enregistrées ne peuvent pas augmenter via l’event réseau, et le joueur doit être à côté du véhicule.

**Police.** Se menotter ou se démenotter n’est accepté que dans les 20 secondes qui suivent un menottage lancé par un joueur proche ayant des menottes. Une amende est un entier entre 1 et 100 000, par un policier en service. La prison est entre 1 et 999. La saisie d’argent liquide exige un policier en service et une cible menottée, morte ou à terre. Voler l’argent d’un joueur exige la même incapacité, pas seulement d’être à côté.

**Mécano.** Les mods, pièces et kilométrage ne s’écrivent que pour le véhicule dans lequel le joueur se trouve (ou à côté, pour un mécano). Une pièce ne peut pas remonter sans être mécano en service. Le kilométrage ne peut gagner que 2 km par envoi, et n’est écrit en base qu’une fois toutes les 15 secondes. La distance n’est plus comptée deux fois.

**Stress.** Un event client ne peut ajouter que 8 points (au plus une fois toutes les 800 ms) ou en retirer 24 (au plus une fois toutes les 1,5 s). Un revive remet le stress à 0 côté serveur.

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

**Mort.** Le state bag `gns_medical:deathState` n’est plus une source de vérité. Une écriture client (`replicated`) est ignorée et réécrite depuis la metadata. Le client ne peut qu’empirer son état (vivant → last stand → mort). Revenir à vivant passe par un revive serveur. Le respawn exige `metadata.isdead` et au moins 30 secondes depuis la mort, pour qu’un client ne se téléporte pas à l’hôpital en se déclarant mort.

**Véhicules d’occasion.** La vente, le rachat et l’achat vérifient la zone, le propriétaire et un verrou par plaque. Le prix de rachat vient du modèle en base. Le spawn utilise le point du concessionnaire, pas les coordonnées du client.

**Clés.** Verrouiller exige les clés, un véhicule de service, ou le premier état encore vide. Déverrouiller sans clés exige un crochet et d’être à côté. Le hotwire exige d’être au volant avec un crochet. Prendre les clés d’un PNJ exige qu’il soit mort, au volant, et pas un joueur.

**Customs.** La zone est calculée sur le serveur à partir de la position du joueur. Le prix de réparation lit la carrosserie de l’entité. La sauvegarde des mods n’écrit que la plaque du véhicule conduit, dans une zone customs.

**Alerte radar.** `GetQBPlayers` est une map indexée par source. L’alerte parcourt cette map et envoie à `PlayerData.source`.

## Ce qui n’est pas couvert

La santé et l’armure du ped restent lues sur l’entité au moment de la sauvegarde. Sur GTA, le client a la main sur son ped : ce n’est pas une autorité serveur complète. Un joueur peut encore baisser sa vie pour entrer en last stand. Il ne peut plus annuler cet état ni respawn sans le délai serveur.

Les jobs (`gns_police`, braquages, courses, etc.) ont leurs propres net events. Banque, supérette, éboueur, hôpital, occasions et vente de rue sont bornés. Les autres events qui paient doivent encore vérifier la distance, le job et un rate limit avant une ouverture publique.

`group.admin` n’a plus `command allow`. ox_lib accorde chaque commande au groupe nommé dans `restricted`. Le staff quotidien va dans `group.mod`.

## Compatibilité et surface d’attaque

`provide 'qbx_core'` et la copie des événements `qbx_core:*` existent pour que Ox et les scripts QB démarrent. Ils ne rajoutent pas de nouvelle action : ce sont les mêmes handlers. Désactiver le pont QB (`set gns:enableBridge "false"`) retire l’objet `qb-core`, pas les événements `gns_core:*`.

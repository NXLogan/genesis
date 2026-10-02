# Ajouter une ressource

Place le dossier dans `resources/[gns]/mon_script`. Le `ensure [gns]` de `server.cfg` le démarre tout seul.

## Manifest

```lua
fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'mon_script'
description 'Exemple Genesis'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
}

client_script 'client.lua'
server_script 'server.lua'

dependencies {
    'gns_core',
    'ox_lib',
}
```

## Lire le joueur

Côté serveur, ne fais pas confiance à l’id envoyé par le client. `source` est le seul identifiant réseau valable.

```lua
lib.callback.register('mon_script:server:payer', function(source, montant)
    if type(montant) ~= 'number' then return false end
    if not exports.gns_core:GuardAllow(source, 'payer', 4, 10000) then return false end

    local player = exports.gns_core:GetPlayer(source)
    if not player then return false end

    -- Le montant utile vient de ta config serveur, pas du client.
    local prix = 250
    if not player.Functions.RemoveMoney('cash', prix, 'mon-script') then
        return false
    end
    return true
end)
```

`GNS` n’existe que dans `gns_core`. Depuis une autre ressource, passe par `exports.gns_core`.

Pour un job, côté serveur le premier argument est le `source` :

```lua
if not exports.gns_core:HasPrimaryGroup(source, 'police') then return end
```

## Événements

Préfixe `mon_script:server:` et `mon_script:client:`. N’écoute pas un event client pour créditer de l’argent.

Les événements du core à connaître :

| Événement | Moment |
|---|---|
| `QBCore:Server:PlayerLoaded` | Personnage chargé (pont, argument = objet joueur) |
| `gns_core:server:playerLoggedOut` | Déconnexion du personnage |
| `gns_core:server:onGroupUpdate` | Changement de job ou de gang |
| `QBCore:Player:SetPlayerData` | Données joueur mises à jour |

## Items

Les items vivent dans `ox_inventory` (`data/items.lua` a déjà été remplacé par la liste Genesis). Pour un item utilisable :

```lua
exports.gns_core:CreateUseableItem('water', function(source)
    -- retire l'item via ox_inventory, puis
    local player = exports.gns_core:GetPlayer(source)
    player.Functions.SetMetaData('thirst', (player.PlayerData.metadata.thirst or 0) + 20)
end)
```

`SetMetaData` borne la soif à 100 et met à jour le state bag. Inutile de l’écrire depuis le client.

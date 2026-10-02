local GNS = exports.gns_core

function GetPlayer(playerId)
    local player = { source = playerId }
    return player
end

function GetCharacterId(player)
	return GNS:GetPlayer(player.source).PlayerData.citizenid
end

function IsPlayerInGroup(player, filter)
    return GNS:HasGroup(player.source, filter)
end

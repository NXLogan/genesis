if IsDuplicityVersion() then return end

GNS = {} -- luacheck: ignore
GNS.PlayerData = exports.gns_core:GetPlayerData() or {}

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    ---@diagnostic disable-next-line: missing-fields
    GNS.PlayerData = {}
end)

RegisterNetEvent('QBCore:Player:SetPlayerData', function(value)
    GNS.PlayerData = value
end)

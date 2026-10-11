local config = require 'config.server'
local clientConfig = require 'config.client'

---@param src number
---@param vehicle number
---@return boolean
local function isDriver(src, vehicle)
    local ped = GetPlayerPed(src)
    return ped ~= 0 and GetPedInVehicleSeat(vehicle, -1) == ped
end

---@param src number
---@return boolean
local function hasLockpick(src)
    local lockpick = exports.ox_inventory:Search(src, 'count', 'lockpick') or 0
    local advanced = exports.ox_inventory:Search(src, 'count', 'advancedlockpick') or 0
    return lockpick > 0 or advanced > 0
end

---@param src number
---@param vehicle number
---@return boolean
local function hasJobSharedKeys(src, vehicle)
    local shared = clientConfig.sharedKeys
    if not shared then return false end
    local player = exports.gns_core:GetPlayer(src)
    local job = player and player.PlayerData.job
    if not job then return false end
    local profile = shared[job.name]
    if not profile then return false end
    if profile.requireOnDuty and not job.onduty then return false end
    if profile.classes and profile.classes[GetVehicleClass(vehicle)] then return true end
    local model = GetEntityModel(vehicle)
    return profile.vehicles and profile.vehicles[model] or false
end

---@param veh number
---@param state string
local function setLockState(veh, state)
	if type(state) ~= 'string' or not DoesEntityExist(veh) then return end
    local vehicleConfig = GetVehicleConfig(veh)
    if vehicleConfig.noLock or vehicleConfig.shared then return end
    Entity(veh).state:set('doorslockstate', state == 'lock' and 2 or 1, true)
end
exports('SetLockState', setLockState)

lib.callback.register('gns_vehiclekeys:server:findKeys', function(source, netId)
    local vehicle = NetworkGetEntityFromNetworkId(netId)
    if not IsPlayerNearVehicle(source, vehicle) then return end
    if math.random() <= GetVehicleConfig(vehicle).findKeysChance then
        GiveKeys(source, vehicle)
        return true
    end
end)

lib.callback.register('gns_vehiclekeys:server:carjack', function(source, netId, weaponTypeGroup)
    local vehicle = NetworkGetEntityFromNetworkId(netId)
    if not IsPlayerNearVehicle(source, vehicle) then return end
    local chance = config.carjackChance[weaponTypeGroup] or 0.5
    if math.random() <= chance then
        GiveKeys(source, vehicle)
        setLockState(vehicle, 'unlock')
        return true
    end
end)

RegisterNetEvent('gns_vehiclekeys:server:playerEnteredVehicleWithEngineOn', function(netId)
    local src = source
    if not clientConfig.getKeysWhenEngineIsRunning then return end
    if not exports.gns_core:GuardAllow(src, 'engineKeys', 4, 10000) then return end
    local vehicle = NetworkGetEntityFromNetworkId(netId)
    if not isDriver(src, vehicle) then return end
    if not GetIsVehicleEngineRunning(vehicle) then return end
    GiveKeys(src, vehicle)
end)

RegisterNetEvent('gns_vehiclekeys:server:tookKeys', function(netId)
    local src = source
    if not exports.gns_core:GuardAllow(src, 'tookKeys', 3, 10000) then return end
    local vehicle = NetworkGetEntityFromNetworkId(netId)
    if not IsPlayerNearVehicle(src, vehicle) then return end
    local driver = GetPedInVehicleSeat(vehicle, -1)
    if driver == 0 or IsPedAPlayer(driver) or not IsEntityDead(driver) then return end
    GiveKeys(src, vehicle)
end)

RegisterNetEvent('gns_vehiclekeys:server:hotwiredVehicle', function(netId)
    local src = source
    if not exports.gns_core:GuardAllow(src, 'hotwire', 2, 10000) then return end
    local vehicle = NetworkGetEntityFromNetworkId(netId)
    if not isDriver(src, vehicle) or HasKeys(src, vehicle) then return end
    if not hasLockpick(src) then return end
    GiveKeys(src, vehicle)
end)

RegisterNetEvent('qb-vehiclekeys:server:breakLockpick', function(itemName)
    if not (itemName == 'lockpick' or itemName == 'advancedlockpick') then return end
    exports.ox_inventory:RemoveItem(source, itemName, 1)
end)

RegisterNetEvent('qb-vehiclekeys:server:setVehLockState', function(netId, state)
    local src = source
    if state ~= 1 and state ~= 2 then return end
    if not exports.gns_core:GuardAllow(src, 'vehLock', 8, 10000) then return end
    local vehicle = NetworkGetEntityFromNetworkId(netId)
    if not IsPlayerNearVehicle(src, vehicle) then return end

    local current = Entity(vehicle).state.doorslockstate
    local allowed = HasKeys(src, vehicle) or hasJobSharedKeys(src, vehicle)
    if not allowed and current == nil then
        allowed = true
    elseif not allowed and state == 1 and current == 2 and hasLockpick(src) then
        allowed = true
    end
    if not allowed then return end

    setLockState(vehicle, state == 2 and 'lock' or 'unlock')
end)

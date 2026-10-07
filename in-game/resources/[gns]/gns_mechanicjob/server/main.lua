local config = require 'config.server'
local sharedConfig = require 'config.shared'
local vehicleStatus = {}
local vehicleDrivingDistance = {}
local stash = {
    id = 'mechanicstash',
    label = locale('labels.stash'),
    slots = 500,
    weight = 4000000,
    owner = false,
    groups = {mechanic = 0},
    coords = sharedConfig.locations.stash
}
exports.ox_inventory:RegisterStash(stash.id, stash.label, stash.slots, stash.weight, stash.owner, stash.groups, stash.coords)

-- Functions

local partLimits = {
    engine = 1000,
    body = 1000,
    radiator = 100,
    axle = 100,
    brakes = 100,
    clutch = 100,
    fuel = 100,
}

local distanceWrite = {}

local function isVehicleOwned(plate)
    local count = MySQL.scalar.await('SELECT count(*) from player_vehicles WHERE plate = ?', {plate})
    return count > 0
end

local function isMechanic(src)
    local player = exports.gns_core:GetPlayer(src)
    local job = player and player.PlayerData.job
    return job and job.name == 'mechanic' and job.onduty
end

local function canRepair(src)
    return isMechanic(src) or IsPlayerAceAllowed(src --[[@as string]], 'group.god') or IsPlayerAceAllowed(src --[[@as string]], 'admin')
end

---The vehicle the player is in, or a nearby one when a mechanic is working outside it.
---@return number?, string?
local function vehicleMatchingPlate(src, plate, allowNearby)
    if type(plate) ~= 'string' then return end
    plate = gns.string.trim(plate)
    if plate == '' or #plate > 8 then return end
    local ped = GetPlayerPed(src)
    if ped == 0 then return end

    local veh = GetVehiclePedIsIn(ped, false)
    if veh ~= 0 and gns.getVehiclePlate(veh) == plate then
        return veh, plate
    end
    if not allowNearby then return end

    local coords = GetEntityCoords(ped)
    local vehicles = GetAllVehicles()
    for i = 1, #vehicles do
        local candidate = vehicles[i]
        if gns.getVehiclePlate(candidate) == plate and #(coords - GetEntityCoords(candidate)) <= 8.0 then
            return candidate, plate
        end
    end
end

local function clampPart(part, level)
    local maxLevel = partLimits[part]
    level = tonumber(level)
    if not maxLevel or not level or level ~= level then return end
    if level < 0 then return 0 end
    if level > maxLevel then return maxLevel end
    return level
end

local function getVehicleStatus(plate)
    local result = MySQL.query.await('SELECT status FROM player_vehicles WHERE plate = ?', {plate})
    if result[1] and result[1].status then
        return json.decode(result[1].status)
    end
end

local function isAuthorized(citizenId)
    for i = 1, #config.authorizedIds do
        if config.authorizedIds[i] == citizenId then
            return true
        end
    end
    return false
end

-- Callbacks

lib.callback.register('qb-vehicletuning:server:GetDrivingDistances', function()
    return vehicleDrivingDistance
end)

lib.callback.register('qb-vehicletuning:server:IsVehicleOwned', function(_, plate)
    return MySQL.scalar.await('SELECT 1 from player_vehicles WHERE plate = ?', {plate})
end)

lib.callback.register('qb-vehicletuning:server:GetAttachedVehicle', function()
    return sharedConfig.plates
end)

lib.callback.register('gns_mechanicjob:server:spawnVehicle', function(source, vehicleName, vehicleCoords)
	local netId = gns.spawnVehicle({
        model = joaat(vehicleName),
        spawnSource = vehicleCoords,
        warp = GetPlayerPed(source)
    })
	return netId
end)

lib.callback.register('gns_mechanicjob:server:checkForItems', function(source, part)
    local itemName = sharedConfig.repairCostAmount[part].item
    local amountRequired = sharedConfig.repairCostAmount[part].costs
    local amount = exports.ox_inventory:Search(source, 'count', itemName)
    local hasEnough = amount >= amountRequired
    if hasEnough then
        exports.ox_inventory:RemoveItem(source, itemName, amountRequired)
    end
    return hasEnough
end)

-- Events

RegisterNetEvent('qb-vehicletuning:server:SaveVehicleProps', function(vehicleProps)
    if type(vehicleProps) ~= 'table' then return end
    local vehicle, plate = vehicleMatchingPlate(source, vehicleProps.plate, isMechanic(source))
    if not vehicle or not plate or not isVehicleOwned(plate) then return end
    local ped = GetPlayerPed(source)
    if GetPedInVehicleSeat(vehicle, -1) ~= ped and not isMechanic(source) then return end

    vehicleProps.plate = plate
    local encoded = json.encode(vehicleProps)
    if not encoded or #encoded > 20000 then return end

    MySQL.update.await('UPDATE player_vehicles SET mods = ? WHERE plate = ?', {encoded, plate})
end)

RegisterNetEvent('vehiclemod:server:setupVehicleStatus', function(plate, engineHealth, bodyHealth)
    local _, cleanPlate = vehicleMatchingPlate(source, plate, false)
    if not cleanPlate or vehicleStatus[cleanPlate] then return end
    plate = cleanPlate
    engineHealth = clampPart('engine', engineHealth) or 1000.0
    bodyHealth = clampPart('body', bodyHealth) or 1000.0

    local statusInfo = vehicleStatus[plate] or getVehicleStatus(plate) or
        {
            engine = engineHealth,
            body = bodyHealth,
            radiator = sharedConfig.maxStatusValues.radiator,
            axle = sharedConfig.maxStatusValues.axle,
            brakes = sharedConfig.maxStatusValues.brakes,
            clutch = sharedConfig.maxStatusValues.clutch,
            fuel = sharedConfig.maxStatusValues.fuel
        }

    vehicleStatus[plate] = statusInfo
    TriggerClientEvent("vehiclemod:client:setVehicleStatus", -1, plate, statusInfo)
end)

RegisterNetEvent('qb-vehicletuning:server:UpdateDrivingDistance', function(amount, plate)
    local _, cleanPlate = vehicleMatchingPlate(source, plate, false)
    amount = tonumber(amount)
    if not cleanPlate or not amount or amount < 0 or amount > 10000000 then return end

    if vehicleDrivingDistance[cleanPlate] == nil then
        vehicleDrivingDistance[cleanPlate] = tonumber(MySQL.scalar.await('SELECT drivingdistance FROM player_vehicles WHERE plate = ?', {cleanPlate})) or 0
    end
    local previous = vehicleDrivingDistance[cleanPlate]
    if amount > previous + 2000 then
        amount = previous + 2000
    end
    if amount < previous then return end
    vehicleDrivingDistance[cleanPlate] = amount

    local now = GetGameTimer()
    local last = distanceWrite[cleanPlate]
    if last and (now - last) < 15000 then return end
    distanceWrite[cleanPlate] = now

    TriggerClientEvent('qb-vehicletuning:client:UpdateDrivingDistance', -1, amount, cleanPlate)
    MySQL.update.await('UPDATE player_vehicles SET drivingdistance = ? WHERE plate = ?', {amount, cleanPlate})
end)

RegisterNetEvent('qb-vehicletuning:server:LoadStatus', function(_, plate)
    local _, cleanPlate = vehicleMatchingPlate(source, plate, false)
    if not cleanPlate or vehicleStatus[cleanPlate] then return end
    local stored = getVehicleStatus(cleanPlate)
    if not stored then return end
    vehicleStatus[cleanPlate] = stored
    TriggerClientEvent('vehiclemod:client:setVehicleStatus', -1, cleanPlate, stored)
end)

local function setPartLevel(src, plate, part, level)
    level = clampPart(part, level)
    local _, cleanPlate = vehicleMatchingPlate(src, plate, isMechanic(src))
    if not level or not cleanPlate or not vehicleStatus[cleanPlate] then return end
    local current = vehicleStatus[cleanPlate][part]
    if type(current) == 'number' and level > current and not canRepair(src) then return end

    vehicleStatus[cleanPlate][part] = level
    TriggerClientEvent('vehiclemod:client:setVehicleStatus', -1, cleanPlate, vehicleStatus[cleanPlate])
end

RegisterNetEvent('vehiclemod:server:updatePart', function(plate, part, level)
    setPartLevel(source, plate, part, level)
end)

RegisterNetEvent('qb-vehicletuning:server:SetPartLevel', function(plate, part, level)
    setPartLevel(source, plate, part, level)
end)

RegisterNetEvent('vehiclemod:server:fixEverything', function(plate)
    local _, cleanPlate = vehicleMatchingPlate(source, plate, true)
    if not cleanPlate or not canRepair(source) or not vehicleStatus[cleanPlate] then return end
    plate = cleanPlate

    for k, v in pairs(sharedConfig.maxStatusValues) do
        vehicleStatus[plate][k] = v
    end

    TriggerClientEvent("vehiclemod:client:setVehicleStatus", -1, plate, vehicleStatus[plate])
end)

RegisterNetEvent('vehiclemod:server:saveStatus', function(plate)
    local _, cleanPlate = vehicleMatchingPlate(source, plate, canRepair(source))
    if not cleanPlate or not vehicleStatus[cleanPlate] then return end

    MySQL.update.await('UPDATE player_vehicles SET status = ? WHERE plate = ?', { json.encode(vehicleStatus[cleanPlate]), cleanPlate })
end)

RegisterNetEvent('qb-vehicletuning:server:SetAttachedVehicle', function(k, veh)
    if not canRepair(source) or not sharedConfig.plates[k] then return end

    sharedConfig.plates[k].AttachedVehicle = veh
    TriggerClientEvent('qb-vehicletuning:client:SetAttachedVehicle', -1, veh, k)
end)

-- Commands

lib.addCommand('setvehiclestatus', {
    help = 'Set Vehicle Status',
    params = {
        {
            name = 'part',
            type = 'string',
            help = 'Type The Part You Want To Edit',
        },
        {
            name = 'amount',
            type = 'number',
            help = 'The Percentage Fixed',
        },
    },
    restricted = 'group.god'
}, function(source, args)
    local part = args.part:lower()
    local level = args.amount
    TriggerClientEvent("vehiclemod:client:setPartLevel", source, part, level)
end)

lib.addCommand('setmechanic', {
    help = 'Give Someone The Mechanic job',
    params = {
        {
            name = 'target',
            type = 'playerId',
            help = 'ID Of The Player',
        },
    },
}, function(source, args)
    local player = exports.gns_core:GetPlayer(source)

    if isAuthorized(player.PlayerData.citizenid) then
        if args.target then
            local targetData = exports.gns_core:GetPlayer(args.target)
            if targetData then
                targetData.Functions.SetJob("mechanic")
                TriggerClientEvent('QBCore:Notify', targetData.PlayerData.source, "You Were Hired As An Autocare Employee!")
                TriggerClientEvent('QBCore:Notify', source, "You have (" .. targetData.PlayerData.charinfo.firstname .. ") Hired As An Autocare Employee!")
            end
        else
            TriggerClientEvent('QBCore:Notify', source, "You Must Provide A Player ID!")
        end
    else
        TriggerClientEvent('QBCore:Notify', source, "You Cannot Do This!", "error")
    end
end)

lib.addCommand('firemechanic', {
    help = 'Fire A Mechanic',
    params = {
        {
            name = 'target',
            type = 'playerId',
            help = 'ID Of The Player',
        },
    },
}, function(source, args)
    local player = exports.gns_core:GetPlayer(source)

    if isAuthorized(player.PlayerData.citizenid) then
        if args.target then
            local TargetData = exports.gns_core:GetPlayer(args.target)
            if TargetData then
                if TargetData.PlayerData.job.name == "mechanic" then
                    TargetData.Functions.SetJob("unemployed")
                    TriggerClientEvent('QBCore:Notify', TargetData.PlayerData.source,  "You Were Fired As An Autocare Employee!")
                    TriggerClientEvent('QBCore:Notify', source, "You have (" .. TargetData.PlayerData.charinfo.firstname .. ") Fired As Autocare Employee!")
                else
                    TriggerClientEvent('QBCore:Notify', source, "Youre Not An Employee of Autocare!", "error")
                end
            end
        else
            TriggerClientEvent('QBCore:Notify', source, "You Must Provide A Player ID!", "error")
        end
    else
        TriggerClientEvent('QBCore:Notify', source, "You Cannot Do This!", "error")
    end
end)
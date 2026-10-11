local VEHICLES = exports.gns_core:GetVehiclesByName()
local salesConfig = require 'config.client'

local saleLocks = {}
local pendingSpawns = {}

local function generateOID()
    local num = math.random(1, 10) .. math.random(111, 999)
    return 'OC' .. num
end

---@param point vector3
---@param vertices vector3[]
---@return boolean
local function isPointInPoly(point, vertices)
    local inside = false
    local j = #vertices
    for i = 1, #vertices do
        local vi, vj = vertices[i], vertices[j]
        if ((vi.y > point.y) ~= (vj.y > point.y))
            and (point.x < (vj.x - vi.x) * (point.y - vi.y) / ((vj.y - vi.y) ~= 0 and (vj.y - vi.y) or 1) + vi.x) then
            inside = not inside
        end
        j = i
    end
    return inside
end

---@param src number
---@return table?
local function salesZoneFor(src)
    local ped = GetPlayerPed(src)
    if ped == 0 then return end
    local coords = GetEntityCoords(ped)
    for _, zone in pairs(salesConfig.zones) do
        local origin = zone.polyzone and zone.polyzone[1]
        if origin and math.abs(coords.z - origin.z) <= 20.0 and isPointInPoly(coords, zone.polyzone) then
            return zone
        end
    end
end

---@param plate string
---@param fn fun()
local function trimPlate(plate)
    if type(plate) ~= 'string' then return end
    plate = plate:match('^%s*(.-)%s*$')
    if not plate or plate == '' or #plate > 8 then return end
    return plate
end

local function withPlateLock(plate, fn)
    if saleLocks[plate] then return false end
    saleLocks[plate] = true
    local ok, result = pcall(fn)
    saleLocks[plate] = nil
    if not ok then
        lib.print.error(result)
        return false
    end
    return result == true
end

---@param src number
---@return number? vehicle
---@return string? plate
local function occupiedVehicle(src)
    local ped = GetPlayerPed(src)
    if ped == 0 then return end
    local vehicle = GetVehiclePedIsIn(ped, false)
    if vehicle == 0 or GetPedInVehicleSeat(vehicle, -1) ~= ped then return end
    return vehicle, trimPlate(GetVehicleNumberPlateText(vehicle))
end

---@param model string
---@return number
local function catalogPrice(model)
    local info = type(model) == 'string' and VEHICLES[model]
    if info and tonumber(info.price) then
        return tonumber(info.price)
    end
    if type(model) == 'string' then
        local hash = joaat(model)
        for _, vehicle in pairs(VEHICLES) do
            if vehicle.hash == hash then
                return tonumber(vehicle.price) or 0
            end
        end
    end
    return 0
end

---@param src number
---@param data { model: string, plate: string, mods: string }
local function allowSpawn(src, data)
    pendingSpawns[src] = {
        model = data.model,
        plate = data.plate,
        mods = data.mods,
        expires = os.time() + 30,
    }
end

lib.callback.register('qb-occasions:server:getVehicles', function()
    local result = MySQL.query.await('SELECT * FROM occasion_vehicles')
    if result[1] then
        return result
    end
end)

lib.callback.register('qb-occasions:server:getSellerInformation', function(_, citizenId)
    if type(citizenId) ~= 'string' or not citizenId:match('^[%w]+$') then return end
    local row = MySQL.single.await('SELECT charinfo FROM players WHERE citizenid = ?', { citizenId })
    if not row then return end
    return { charinfo = row.charinfo }
end)

lib.callback.register('qb-vehiclesales:server:CheckModelName', function(_, plate)
    if type(plate) ~= 'string' or #plate > 12 then return end
    return MySQL.scalar.await('SELECT vehicle FROM player_vehicles WHERE plate = ?', { plate })
end)

lib.callback.register('gns_vehiclesales:server:spawnVehicle', function(source)
    local pending = pendingSpawns[source]
    pendingSpawns[source] = nil
    if not pending or pending.expires < os.time() then return end

    local zone = salesZoneFor(source)
    if not zone then return end

    local props = type(pending.mods) == 'string' and json.decode(pending.mods) or pending.mods
    local netId, veh = gns.spawnVehicle({
        model = pending.model,
        spawnSource = zone.buyVehicle,
        warp = false,
        props = props,
    })
    if not veh or veh == 0 then return end

    SetVehicleNumberPlateText(veh, pending.plate)
    exports.gns_vehiclekeys:GiveKeys(source, veh)
    return netId
end)

lib.callback.register('gns_vehiclesales:server:checkVehicleOwner', function(source, plate)
    local player = exports.gns_core:GetPlayer(source)
    if not player or type(plate) ~= 'string' then return false end
    local result = MySQL.single.await('SELECT * FROM player_vehicles WHERE plate = ? AND citizenid = ?', { plate, player.PlayerData.citizenid })

    if result and result.id then
        local financeRow = MySQL.single.await('SELECT balance FROM vehicle_financing WHERE vehicleId = ?', { result.id })
        return true, financeRow and financeRow.balance or 0
    end

    return false
end)

RegisterNetEvent('qb-occasions:server:ReturnVehicle', function(vehicleData)
    local src = source
    if not exports.gns_core:GuardAllow(src, 'returnVehicle', 4, 10000) then return end
    local player = exports.gns_core:GetPlayer(src)
    if not player or type(vehicleData) ~= 'table' or not salesZoneFor(src) then return end
    if type(vehicleData.plate) ~= 'string' or type(vehicleData.oid) ~= 'string' then return end

    withPlateLock(vehicleData.plate, function()
        local listing = MySQL.single.await('SELECT * FROM occasion_vehicles WHERE plate = ? AND occasionid = ?', { vehicleData.plate, vehicleData.oid })
        if not listing then
            exports.gns_core:Notify(src, locale('error.vehicle_does_not_exist'), 'error', 3500)
            return
        end
        if listing.seller ~= player.PlayerData.citizenid then
            exports.gns_core:Notify(src, locale('error.not_your_vehicle'), 'error', 3500)
            return
        end

        local removed = MySQL.update.await('DELETE FROM occasion_vehicles WHERE occasionid = ? AND plate = ?', { listing.occasionid, listing.plate })
        if not removed or removed < 1 then return end

        MySQL.insert.await('INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state) VALUES (?, ?, ?, ?, ?, ?, ?)', {
            player.PlayerData.license,
            player.PlayerData.citizenid,
            listing.model,
            joaat(listing.model),
            listing.mods,
            listing.plate,
            0,
        })
        allowSpawn(src, listing)
        TriggerClientEvent('qb-occasions:client:ReturnOwnedVehicle', src, listing)
        TriggerClientEvent('qb-occasion:client:refreshVehicles', -1)
        return true
    end)
end)

local function sellVehicle(src, vehiclePrice, vehicleData)
    if not exports.gns_core:GuardAllow(src, 'sellVehicle', 4, 10000) then return false end
    local player = exports.gns_core:GetPlayer(src)
    if not player or type(vehicleData) ~= 'table' or not salesZoneFor(src) then return false end

    local _, plate = occupiedVehicle(src)
    if not plate or plate ~= trimPlate(vehicleData.plate) then return false end

    local price = tonumber(vehiclePrice)
    if not price or price ~= math.floor(price) or price < 1 or price > 5000000 then return false end

    local description = type(vehicleData.desc) == 'string' and vehicleData.desc:gsub('[%c]', ''):sub(1, 200) or ''
    local row = MySQL.single.await('SELECT * FROM player_vehicles WHERE TRIM(plate) = ? AND citizenid = ?', { plate, player.PlayerData.citizenid })
    if not row then return false end

    local finance = MySQL.single.await('SELECT balance FROM vehicle_financing WHERE vehicleId = ?', { row.id })
    if finance and (tonumber(finance.balance) or 0) > 0 then
        exports.gns_core:Notify(src, locale('error.finish_payments'), 'error', 3500)
        return false
    end

    return withPlateLock(plate, function()
        local removed = MySQL.update.await('DELETE FROM player_vehicles WHERE id = ? AND citizenid = ?', { row.id, player.PlayerData.citizenid })
        if not removed or removed < 1 then return end

        MySQL.insert.await('INSERT INTO occasion_vehicles (seller, price, description, plate, model, mods, occasionid) VALUES (?, ?, ?, ?, ?, ?, ?)', {
            player.PlayerData.citizenid,
            price,
            description,
            row.plate,
            row.vehicle,
            row.mods,
            generateOID(),
        })
        TriggerClientEvent('qb-occasion:client:refreshVehicles', -1)
        return true
    end)
end

RegisterNetEvent('qb-occasions:server:sellVehicle', function(vehiclePrice, vehicleData)
    sellVehicle(source, vehiclePrice, vehicleData)
end)

lib.callback.register('gns_vehiclesales:server:sellVehicle', function(source, vehiclePrice, vehicleData)
    return sellVehicle(source, vehiclePrice, vehicleData)
end)

local function sellVehicleBack(src)
    if not exports.gns_core:GuardAllow(src, 'sellVehicleBack', 4, 10000) then return false end
    local player = exports.gns_core:GetPlayer(src)
    if not player or not salesZoneFor(src) then return false end

    local _, plate = occupiedVehicle(src)
    if not plate then
        exports.gns_core:Notify(src, locale('error.not_in_veh'), 'error', 4500)
        return false
    end

    local row = MySQL.single.await('SELECT * FROM player_vehicles WHERE TRIM(plate) = ? AND citizenid = ?', { plate, player.PlayerData.citizenid })
    if not row then
        exports.gns_core:Notify(src, locale('error.not_your_vehicle'), 'error', 3500)
        return false
    end

    local finance = MySQL.single.await('SELECT balance FROM vehicle_financing WHERE vehicleId = ?', { row.id })
    if finance and (tonumber(finance.balance) or 0) > 0 then
        exports.gns_core:Notify(src, locale('error.finish_payments'), 'error', 3500)
        return false
    end

    local payout = math.floor(catalogPrice(row.vehicle) * 0.5)
    return withPlateLock(plate, function()
        local removed = MySQL.update.await('DELETE FROM player_vehicles WHERE id = ? AND citizenid = ?', { row.id, player.PlayerData.citizenid })
        if not removed or removed < 1 then return end
        player.Functions.AddMoney('bank', payout, 'sold-vehicle-back')
        exports.gns_core:Notify(src, (locale('success.sold_car_for_price'):format(payout)), 'success', 5500)
        return true
    end)
end

RegisterNetEvent('qb-occasions:server:sellVehicleBack', function()
    sellVehicleBack(source)
end)

lib.callback.register('gns_vehiclesales:server:sellVehicleBack', function(source)
    return sellVehicleBack(source)
end)

RegisterNetEvent('qb-occasions:server:buyVehicle', function(vehicleData)
    local src = source
    if not exports.gns_core:GuardAllow(src, 'buyVehicle', 4, 10000) then return end
    local player = exports.gns_core:GetPlayer(src)
    if not player or type(vehicleData) ~= 'table' or not salesZoneFor(src) then return end
    if type(vehicleData.plate) ~= 'string' or type(vehicleData.oid) ~= 'string' then return end

    withPlateLock(vehicleData.plate, function()
        local listing = MySQL.single.await('SELECT * FROM occasion_vehicles WHERE plate = ? AND occasionid = ?', { vehicleData.plate, vehicleData.oid })
        if not listing then return end
        if listing.seller == player.PlayerData.citizenid then return end

        local price = tonumber(listing.price) or 0
        if price < 1 or (player.PlayerData.money.bank or 0) < price then
            exports.gns_core:Notify(src, locale('error.not_enough_money'), 'error', 3500)
            return
        end

        local removed = MySQL.update.await('DELETE FROM occasion_vehicles WHERE plate = ? AND occasionid = ?', { listing.plate, listing.occasionid })
        if not removed or removed < 1 then return end

        if not player.Functions.RemoveMoney('bank', price, 'bought-occasion-vehicle') then
            MySQL.insert.await('INSERT INTO occasion_vehicles (seller, price, description, plate, model, mods, occasionid) VALUES (?, ?, ?, ?, ?, ?, ?)', {
                listing.seller, listing.price, listing.description, listing.plate, listing.model, listing.mods, listing.occasionid,
            })
            return
        end

        local sellerPayout = math.ceil((price / 100) * 77)
        MySQL.insert.await(
            'INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state) VALUES (?, ?, ?, ?, ?, ?, ?)', {
                player.PlayerData.license,
                player.PlayerData.citizenid,
                listing.model,
                joaat(listing.model),
                listing.mods,
                listing.plate,
                0,
            })

        local seller = exports.gns_core:GetPlayerByCitizenId(listing.seller)
        if seller then
            seller.Functions.AddMoney('bank', sellerPayout, 'sold-occasion-vehicle')
        else
            local sellerRow = MySQL.single.await('SELECT money FROM players WHERE citizenid = ?', { listing.seller })
            if sellerRow and sellerRow.money then
                local sellerMoney = json.decode(sellerRow.money)
                if type(sellerMoney) == 'table' then
                    sellerMoney.bank = (sellerMoney.bank or 0) + sellerPayout
                    MySQL.update('UPDATE players SET money = ? WHERE citizenid = ?', { json.encode(sellerMoney), listing.seller })
                end
            end
        end

        allowSpawn(src, listing)
        TriggerClientEvent('qb-occasions:client:BuyFinished', src, listing)
        TriggerClientEvent('qb-occasion:client:refreshVehicles', -1)

        local vehicleInfo = VEHICLES[listing.model]
        local vehicleLabel = vehicleInfo and vehicleInfo.name or listing.model
        TriggerEvent('qb-phone:server:sendNewMailToOffline', listing.seller, {
            sender = locale('mail.sender'),
            subject = locale('mail.subject'),
            message = (locale('mail.message'):format(sellerPayout, vehicleLabel)),
        })
    end)
end)

AddEventHandler('playerDropped', function()
    pendingSpawns[source] = nil
end)

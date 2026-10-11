local sharedConfig = require 'config.shared'

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

---@param source number
---@return number? index
---@return table? zone
local function zoneAtPlayer(source)
    local ped = GetPlayerPed(source)
    if ped == 0 then return end
    local coords = GetEntityCoords(ped)
    for i = 1, #sharedConfig.zones do
        local zone = sharedConfig.zones[i]
        local origin = zone.points and zone.points[1]
        if origin and math.abs(coords.z - origin.z) <= 8.0 and isPointInPoly(coords, zone.points) then
            return i, zone
        end
    end
end

---@param source number
---@param jobs string[]?
---@return boolean
local function playerHasJob(source, jobs)
    if not jobs then return false end
    local jobName = exports.gns_core:GetPlayer(source)?.PlayerData?.job?.name
    if not jobName then return false end
    for i = 1, #jobs do
        if jobName == jobs[i] then
            return true
        end
    end
    return false
end

---@return number?
local function getModPrice(mod, level)
    local entry = sharedConfig.prices[mod]
    if type(entry) == 'number' then return entry end
    if type(entry) ~= 'table' then return end
    level = tonumber(level)
    if not level then return end
    return entry[level]
end

---@param source number
---@param amount number
---@return boolean
local function removeMoney(source, amount)
    local player = exports.gns_core:GetPlayer(source)
    if not player then return false end
    if amount <= 0 then return true end

    local cashBalance = player.Functions.GetMoney('cash')
    local bankBalance = player.Functions.GetMoney('bank')

    if cashBalance >= amount then
        player.Functions.RemoveMoney('cash', amount, locale('general.payReason'))
        return true
    elseif bankBalance >= amount then
        player.Functions.RemoveMoney('bank', amount, locale('general.payReason'))
        exports.gns_core:Notify(source, locale('notifications.success.paid', amount), 'success')
        return true
    end

    return false
end

---@param source number
---@return number? vehicle
local function drivenVehicle(source)
    local ped = GetPlayerPed(source)
    if ped == 0 then return end
    local vehicle = GetVehiclePedIsIn(ped, false)
    if vehicle == 0 or GetPedInVehicleSeat(vehicle, -1) ~= ped then return end
    return vehicle
end

-- Won't charge money for mods if the player's job is in the list
lib.callback.register('gns_customs:server:pay', function(source, mod, level)
    if not exports.gns_core:GuardAllow(source, 'customsPay', 12, 10000) then return false end
    local _, zone = zoneAtPlayer(source)
    if not zone or not drivenVehicle(source) then return false end

    if playerHasJob(source, zone.freeMods) then
        return true
    end

    local price = getModPrice(mod, level)
    if type(price) ~= 'number' or price < 0 or price ~= price or price > 1000000 then return false end
    return removeMoney(source, price)
end)

-- Won't charge money for repairs if the player's job is in the list
lib.callback.register('gns_customs:server:repair', function(source)
    if not exports.gns_core:GuardAllow(source, 'customsRepair', 4, 10000) then return false end
    local _, zone = zoneAtPlayer(source)
    local vehicle = drivenVehicle(source)
    if not zone or not vehicle then return false end

    if playerHasJob(source, zone.freeRepair) then
        return true
    end

    local bodyHealth = GetVehicleBodyHealth(vehicle)
    if type(bodyHealth) ~= 'number' or bodyHealth ~= bodyHealth then return false end
    bodyHealth = math.max(0, math.min(1000, bodyHealth))
    local price = math.ceil(1000 - bodyHealth)
    return removeMoney(source, price)
end)

local function IsVehicleOwned(plate)
    return MySQL.scalar.await('SELECT 1 FROM player_vehicles WHERE plate = ?', { plate }) ~= nil
end

RegisterNetEvent('gns_customs:server:saveVehicleProps', function()
    local src = source --[[@as number]]
    if not exports.gns_core:GuardAllow(src, 'customsSave', 4, 10000) then return end
    if not zoneAtPlayer(src) then return end
    local vehicle = drivenVehicle(src)
    if not vehicle then return end

    local plate = GetVehicleNumberPlateText(vehicle)
    if type(plate) ~= 'string' or plate == '' or not IsVehicleOwned(plate) then return end

    local vehicleProps = lib.callback.await('gns_customs:client:vehicleProps', src)
    if type(vehicleProps) ~= 'table' then return end
    vehicleProps.plate = plate
    MySQL.update.await('UPDATE player_vehicles SET mods = ? WHERE plate = ?', { json.encode(vehicleProps), plate })
end)

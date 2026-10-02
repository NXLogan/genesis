if GetConvar('gns:enablebridge', 'true') == 'false' then return end

require 'bridge.qb.server.debug'
require 'bridge.qb.server.events'

local convertItems = require 'bridge.qb.shared.compat'.convertItems
convertItems(require '@ox_inventory.data.items', require 'shared.items')

---@diagnostic disable-next-line: lowercase-global
qbCoreCompat = {}

qbCoreCompat.Config = lib.table.merge(require 'config.server', require 'config.shared')
qbCoreCompat.Shared = require 'bridge.qb.shared.main'
qbCoreCompat.Shared.Jobs = GetJobs()
qbCoreCompat.Shared.Gangs = GetGangs()
qbCoreCompat.Players = GNS.Players
qbCoreCompat.Player = require 'bridge.qb.server.player'
qbCoreCompat.Player_Buckets = GNS.Player_Buckets
qbCoreCompat.Entity_Buckets = GNS.Entity_Buckets
qbCoreCompat.UsableItems = GNS.UsableItems
qbCoreCompat.Functions = require 'bridge.qb.server.functions'
qbCoreCompat.Commands = require 'bridge.qb.server.commands'

---@diagnostic disable: deprecated

---@deprecated Call lib.print.debug() instead
qbCoreCompat.Debug = lib.print.debug

---@deprecated Call lib.print.error() instead
qbCoreCompat.ShowError = lib.print.error

---@deprecated Use lib.print.info() instead
qbCoreCompat.ShowSuccess = lib.print.info

---@deprecated use https://coxdocs.dev/ox_lib/Modules/Callback/Lua/Server instead
qbCoreCompat.ClientCallbacks = {}

---@deprecated use https://coxdocs.dev/ox_lib/Modules/Callback/Lua/Server instead
qbCoreCompat.ServerCallbacks = {}

-- Callback Events --

-- Client Callback
---@deprecated use https://coxdocs.dev/ox_lib/Modules/Callback/Lua/Server instead
RegisterNetEvent('QBCore:Server:TriggerClientCallback', function(name, ...)
    local key = ('%s:%s'):format(source, name)
    local cb = qbCoreCompat.ClientCallbacks[key]
    if cb then
        qbCoreCompat.ClientCallbacks[key] = nil
        cb(...)
    end
end)

-- Server Callback
---@deprecated use https://coxdocs.dev/ox_lib/Modules/Callback/Lua/Server instead
RegisterNetEvent('QBCore:Server:TriggerCallback', function(name, ...)
    local src = source
    qbCoreCompat.Functions.TriggerCallback(name, src, function(...)
        TriggerClientEvent('QBCore:Client:TriggerCallback', src, name, ...)
    end, ...)
end)

--- @deprecated
RegisterNetEvent('QBCore:CallCommand', function(command, args)
    local src = source --[[@as Source]]
    local player = GetPlayer(src)
    if not player then return end
    if type(command) ~= 'string' or not command:match('^[%w_%-]+$') then return end
    if GNS.Guard and not GNS.Guard.allow(src, 'callCommand', 6, 5000) then return end
    if type(args) ~= 'table' then return end
    if IsPlayerAceAllowed(src --[[@as string]], ('command.%s'):format(command)) then
        local parts = { command }
        for _, value in pairs(args) do
            if type(value) ~= 'string' and type(value) ~= 'number' then return end
            local text = tostring(value)
            if text:find('[\r\n;]') then return end
            parts[#parts + 1] = text
        end
        TriggerClientEvent('QBCore:Command:CallCommand', src, table.concat(parts, ' '))
    end
end)

-- Callback Functions --

-- Client Callback
---@deprecated use https://coxdocs.dev/ox_lib/Modules/Callback/Lua/Server instead
function qbCoreCompat.Functions.TriggerClientCallback(name, source, cb, ...)
    qbCoreCompat.ClientCallbacks[('%s:%s'):format(source, name)] = cb
    TriggerClientEvent('QBCore:Client:TriggerClientCallback', source, name, ...)
end

-- Server Callback
---@deprecated use https://coxdocs.dev/ox_lib/Modules/Callback/Lua/Server instead
function qbCoreCompat.Functions.CreateCallback(name, cb)
    qbCoreCompat.ServerCallbacks[name] = cb
end

---@deprecated call a function instead
function qbCoreCompat.Functions.TriggerCallback(name, source, cb, ...)
    if not qbCoreCompat.ServerCallbacks[name] then return end
    qbCoreCompat.ServerCallbacks[name](source, cb, ...)
end

---@deprecated call server function gns.spawnVehicle from modules/lib.lua
qbCoreCompat.Functions.CreateCallback('QBCore:Server:SpawnVehicle', function(source, cb, model, coords, warp)
    local vehId = qbCoreCompat.Functions.SpawnVehicle(source, model, coords, warp)

    if vehId then cb(NetworkGetNetworkIdFromEntity(vehId)) end
end)

---@deprecated call server function gns.spawnVehicle from modules/lib.lua
qbCoreCompat.Functions.CreateCallback('QBCore:Server:CreateVehicle', function(source, cb, model, coords, warp)
    local vehId = qbCoreCompat.Functions.CreateVehicle(source, model, nil, coords, warp)

    if vehId then cb(NetworkGetNetworkIdFromEntity(vehId)) end
end)

AddEventHandler('gns_core:server:onJobUpdate', function(jobName, job)
    qbCoreCompat.Shared.Jobs[jobName] = job
end)

AddEventHandler('gns_core:server:onGangUpdate', function(gangName, gang)
    qbCoreCompat.Shared.Gangs[gangName] = gang
end)

local createQbExport = require 'bridge.qb.shared.export-function'

createQbExport('GetCoreObject', function()
    return qbCoreCompat
end)

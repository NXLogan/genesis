
local config = require 'config.server'
local sharedConfig = require 'config.shared'
local resetStress = false
local stressCooldown = {}

---@param src number
---@param amount any
---@param cap number
---@param windowMs number
---@return number?
local function takeStressAmount(src, amount, cap, windowMs)
    amount = tonumber(amount)
    if not amount or amount ~= amount or amount <= 0 then return end
    if amount > cap then amount = cap end
    local now = GetGameTimer()
    local last = stressCooldown[src]
    if last and (now - last) < windowMs then return end
    stressCooldown[src] = now
    return amount
end

AddEventHandler('playerDropped', function()
    stressCooldown[source] = nil
end)

-- Handlers

AddEventHandler('ox_inventory:openedInventory', function(source)
    TriggerClientEvent('gns_hud:client:hideHud', source)
end)

AddEventHandler('ox_inventory:closedInventory', function(source)
    TriggerClientEvent('gns_hud:client:showHud', source)
end)

-- Callbacks

lib.callback.register('hud:server:getMenu', function()
    return sharedConfig.menu
end)

-- Network Events

RegisterNetEvent('hud:server:GainStress', function(amount)
    if not sharedConfig.stress.enableStress then return end
    local src = source
    amount = takeStressAmount(src, amount, 8, 800)
    if not amount then return end
    local player = exports.gns_core:GetPlayer(src)
    local newStress
    if not player or (config.stress.disableForLEO and player.PlayerData.job.type == 'leo') then return end
    if not resetStress then
        if not player.PlayerData.metadata.stress then
            player.PlayerData.metadata.stress = 0
        end
        newStress = player.PlayerData.metadata.stress + amount
        if newStress <= 0 then newStress = 0 end
    else
        newStress = 0
    end
    if newStress > 100 then
        newStress = 100
    end
    player.Functions.SetMetaData('stress', newStress)
    TriggerClientEvent('hud:client:UpdateStress', src, newStress)
    exports.gns_core:Notify(src, locale('notify.stress_gain'), 'inform', 2500, nil, nil, {'#141517', '#ffffff'}, 'brain', '#C53030')
end)

RegisterNetEvent('hud:server:RelieveStress', function(amount)
    if not sharedConfig.stress.enableStress then return end
    local src = source
    amount = takeStressAmount(src, amount, 24, 1500)
    if not amount then return end
    local player = exports.gns_core:GetPlayer(src)
    local newStress
    if not player then return end
    if not resetStress then
        if not player.PlayerData.metadata.stress then
            player.PlayerData.metadata.stress = 0
        end
        newStress = player.PlayerData.metadata.stress - amount
        if newStress <= 0 then newStress = 0 end
    else
        newStress = 0
    end
    if newStress > 100 then
        newStress = 100
    end
    player.Functions.SetMetaData('stress', newStress)
    TriggerClientEvent('hud:client:UpdateStress', src, newStress)
    exports.gns_core:Notify(src, locale('notify.stress_removed'), 'inform', 2500, nil, nil, {'#141517', '#ffffff'}, 'brain', '#0F52BA')
end)

-- Commands

lib.addCommand(locale('commands.cash'), {
    help = locale('commands.help.cash'),
    restricted = 'group.admin'
}, function(source)
    local player = exports.gns_core:GetPlayer(source)
    local cashAmount = player.PlayerData.money.cash
    TriggerClientEvent('hud:client:ShowAccounts', source, 'cash', cashAmount)
end)

lib.addCommand(locale('commands.bank'), {
    help = locale('commands.help.bank'),
}, function(source)
    local player = exports.gns_core:GetPlayer(source)
    local bankAmount = player.PlayerData.money.bank
    TriggerClientEvent('hud:client:ShowAccounts', source, 'bank', bankAmount)
end)

lib.addCommand('dev', {
    help = locale('commands.help.dev'),
    restricted = 'group.admin'
}, function(source)
    TriggerClientEvent('qb-admin:client:ToggleDevmode', source)
end)

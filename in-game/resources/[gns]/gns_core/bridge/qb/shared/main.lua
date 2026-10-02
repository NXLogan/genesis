local qbShared = require 'shared.main'

qbShared.Items = {}
local oxItems = require '@ox_inventory.data.items'
for item, data in pairs(oxItems) do
    qbShared.Items[item] = {
        name = item,
        label = data.label,
        weight = data.weight or 0,
        type = 'item',
        image = data.client?.image or string.strjoin(item,'.png'),
        unique = false,
        useable = true,
        shouldClose = data.close or true,
        combinable = nil,
        description = data.description or nil
    }
end
local oxWeapons = require '@ox_inventory.data.weapons'
for weapon, data in pairs(oxWeapons.Weapons) do
    weapon = string.lower(weapon)
    qbShared.Items[weapon] = {
        name = weapon,
        label = data.label,
        weight = data.weight,
        type = 'weapon',
        ammotype = data.ammoname or nil,
        image = data.client?.image or string.strjoin(weapon,'.png'),
        unique = true,
        useable = false,
        shouldClose = true,
        combinable = nil,
        description = nil
    }
end
for component, data in pairs(oxWeapons.Components) do
    component = string.lower(component)
    qbShared.Items[component] = {
        name = component,
        label = data.label,
        weight = data.weight,
        type = 'component',
        image = data.client?.image or string.strjoin(component,'.png'),
        unique = true,
        useable = false,
        shouldClose = true,
        combinable = nil,
        description = data.description
    }
end
for ammo, data in pairs(oxWeapons.Ammo) do
    ammo = string.lower(ammo)
    qbShared.Items[ammo] = {
        name = ammo,
        label = data.label,
        weight = data.weight,
        type = 'ammo',
        image = data.client?.image or string.strjoin(ammo,'.png'),
        unique = true,
        useable = false,
        shouldClose = true,
        combinable = nil,
        description = data.description
    }
end

local starterItems = require 'config.shared'.starterItems
---@deprecated use starterItems in config/shared.lua
qbShared.StarterItems = {}

if type(starterItems) == 'table' then
    for i = 1, #starterItems do
        local item = starterItems[i]

        ---@diagnostic disable-next-line: deprecated
        qbShared.StarterItems[item.name] = {
            amount = item.amount,
            item = item.name,
        }
    end
end

---@deprecated use lib.math.groupdigits from ox_lib
qbShared.CommaValue = lib.math.groupdigits

---@deprecated use lib.string.random from ox_lib
qbShared.RandomStr = function(length)
    if length <= 0 then return '' end
    local pattern = math.random(2) == 1 and 'a' or 'A'

    ---@diagnostic disable-next-line: deprecated
    return qbShared.RandomStr(length - 1) .. lib.string.random(pattern)
end

---@deprecated use lib.string.random from ox_lib
qbShared.RandomInt = function(length)
    if length <= 0 then return '' end

    ---@diagnostic disable-next-line: deprecated
    return qbShared.RandomInt(length - 1) .. lib.string.random('1')
end

---@deprecated use string.strsplit with CfxLua 5.4
qbShared.SplitStr = function(str, delimiter)
    local result = table.pack(string.strsplit(delimiter, str))
    result.n = nil
    return result
end

---@deprecated use gns.string.trim from modules/lib.lua
qbShared.Trim = function(str)
    if not str then return nil end
    return gns.string.trim(str)
end

---@deprecated use gns.string.capitalize from modules/lib.lua
qbShared.FirstToUpper = function(str)
    if not str then return nil end
    return gns.string.capitalize(str)
end

---@deprecated use gns.math.round from modules/lib.lua
qbShared.Round = gns.math.round

---@deprecated use gns.setVehicleExtra from modules/lib.lua
qbShared.ChangeVehicleExtra = gns.setVehicleExtras

---@deprecated use gns.setVehicleExtra from modules/lib.lua
qbShared.SetDefaultVehicleExtras = gns.setVehicleExtras

---@deprecated use gns.armsWithoutGloves.male from modules/lib.lua
qbShared.MaleNoGloves = gns.armsWithoutGloves.male

---@deprecated use gns.armsWithoutGloves.female from modules/lib.lua
qbShared.FemaleNoGloves = gns.armsWithoutGloves.female

return qbShared

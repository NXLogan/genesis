if not lib.checkDependency('gns_core', '1.18.0', true) then return end

local GNS = exports.gns_core
local utils = require 'client.utils'

---@diagnostic disable-next-line: duplicate-set-field
function utils.hasPlayerGotGroup(filter)
    return GNS:HasGroup(filter)
end

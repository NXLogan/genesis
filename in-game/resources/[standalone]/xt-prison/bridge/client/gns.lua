if GetResourceState('gns_core') == 'started' then
    if not lib.checkDependency('gns_core', '1.18.0') then
        return lib.print.error('gns_core v1.18.0 is required for xt-prison') -- Requires 1.18.0 for HasGroup export || https://github.com/Genesis-project/gns_core/blob/c6f2b96a3644edce5958c76b447a98afa4801475/server/functions.lua#L447
    end
else return end

-- Load / Unload Events --
RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    TriggerEvent('xt-prison:client:onLoad')
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    TriggerEvent('xt-prison:client:onUnload')
end)
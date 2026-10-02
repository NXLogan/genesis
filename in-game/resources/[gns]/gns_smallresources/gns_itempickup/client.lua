local config = lib.loadJson('gns_itempickup.config')

if #config.disabledPickups == 0 then return end

CreateThread(function()
    for _, hash in ipairs(config.disabledPickups) do
        ToggleUsePickupsForPlayer(cache.playerId, hash, false)
    end
end)

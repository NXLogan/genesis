local config = lib.load('gns_disableservices.config')

CreateThread(function()
    SetMaxWantedLevel(config.maxWantedLevel)
    for key, value in ipairs(config.enabledServices) do
        EnableDispatchService(key, value)
    end
end)
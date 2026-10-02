lib.callback.register('gns_staticemitters:server:IsPlayerAceAllowed', function(src)
    return IsPlayerAceAllowed(src, 'admin')
end)
local function forceConvarValue(name, value, replacement)
    SetConvar(name, value)

    AddConvarChangeListener(name, function()
        if GetConvar(name, '') ~= value then
            SetConvar(name, value)
            lib.print.warn(('Prevented convar %s from being changed, USE %s INSTEAD!'):format(name, replacement))
        end
    end)
end
forceConvarValue('chat_showJoins', 'false', 'gns_chat:joinMessage')
forceConvarValue('chat_showQuits', 'false', 'gns_chat:quitMessage')

AddEventHandler('playerJoining', function()
    local joinMessage = GetConvar('gns_chat:joinMessage', '^2%s joined the server')
    if joinMessage == '' then
        return
    end

    exports.chat:addMessage(-1, {
        templateId = 'join',
        args = { joinMessage:format(GetPlayerName(source)) },
    })
end)

AddEventHandler('playerDropped', function(reason)
    local quitMessage = GetConvar('gns_chat:quitMessage', '^1%s left the server (%s)')
    if quitMessage == '' then
        return
    end

    exports.chat:addMessage(-1, {
        templateId = 'quit',
        args = { quitMessage:format(GetPlayerName(source), reason) },
    })
end)

RegisterNUICallback('config', function(_data, cb)
    cb({
        mainColor = GetConvar('gns_chat:mainColor', '#141517'),
        borderColor = GetConvar('gns_chat:borderColor', '#373a40'),
        textColor = GetConvar('gns_chat:textColor', '#ffffff'),
        faintColor = GetConvar('gns_chat:faintColor', '#c1c2c5'),

        fontFamily = GetConvar('gns_chat:fontFamily', "'Segoe UI', Arial, Helvetica, sans-serif"),
        consoleFontFamily = GetConvar('gns_chat:consoleFontFamily', 'monospace'),
        suggestionFontFamily = GetConvar('gns_chat:suggestionFontFamily', 'monospace'),

        inputIconUrl = GetConvar('gns_chat:inputIconUrl', 'https://cfx-nui-gns_chat_theme/theme/icons/duck.png'),
        messageIconUrl = GetConvar('gns_chat:messageIconUrl', 'https://cfx-nui-gns_chat_theme/theme/icons/message.svg'),
        consoleIconUrl = GetConvar('gns_chat:consoleIconUrl', 'https://cfx-nui-gns_chat_theme/theme/icons/console.svg'),
        joinIconUrl = GetConvar('gns_chat:joinIconUrl', 'https://cfx-nui-gns_chat_theme/theme/icons/join.svg'),
        quitIconUrl = GetConvar('gns_chat:quitIconUrl', 'https://cfx-nui-gns_chat_theme/theme/icons/quit.svg'),
        userIconUrl = GetConvar('gns_chat:userIconUrl', 'https://cfx-nui-gns_chat_theme/theme/icons/user.svg'),
    })
end)

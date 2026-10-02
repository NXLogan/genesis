fx_version 'cerulean'
game 'gta5'

description 'gns_bankrobbery'
repository 'https://github.com/Genesis-project/gns_bankrobbery'
version '1.0.0'

ui_page 'html/index.html'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua'
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/*.lua'
}

server_scripts {
    'server/main.lua'
}

files {
    'config/client.lua',
    'config/shared.lua',
    'html/*',
    'locales/*.json',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'

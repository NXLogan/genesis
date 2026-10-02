fx_version 'cerulean'
game 'gta5'

description 'gns_management'
repository 'https://github.com/Genesis-project/gns_management'
version '1.4.0'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
}

files {
    'config/client.lua',
    'locales/*.json',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
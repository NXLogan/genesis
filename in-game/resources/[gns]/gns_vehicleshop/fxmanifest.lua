fx_version 'cerulean'
game 'gta5'

name 'gns_vehicleshop'
description 'Vehicle shop system for Genesis'
repository 'https://github.com/Genesis-project/gns_vehicleshop'
version '1.0.0'

ox_lib 'locale'

shared_script {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/utils.lua',
    'server/finance.lua'
}

files {
    'client/vehicles.lua',
    'config/client.lua',
    'config/shared.lua',
    'locales/*.json'
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
fx_version 'cerulean'
game 'gta5'

name 'gns_garages'
description 'Garage system for Genesis'
repository 'https://github.com/Genesis-project/gns_garages'
version '1.1.4'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
    'shared/*',
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/default-calculate-impound-fee.lua',
    'server/main.lua',
    'server/spawn-vehicle.lua',
}

files {
    'config/client.lua',
    'locales/*.json',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
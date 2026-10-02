fx_version 'cerulean'
game 'gta5'

description 'gns_drugs'
repository 'https://github.com/Genesis-project/gns_drugs'
version '1.0.0'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/deliveries.lua',
    'client/cornerselling.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/deliveries.lua',
    'server/cornerselling.lua',
}

files {
    'config/client.lua',
    'config/shared.lua',
    'config/server.lua',
    'locales/*.json'
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
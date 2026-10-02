fx_version 'cerulean'
game 'gta5'

description 'GNS_MechanicJob'
repository 'https://github.com/Genesis-project/gns_mechanicjob'
version '1.0.0'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua'
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/damage-effects.lua',
    'client/main.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua'
}

files {
    'locales/*.json',
    'config/client.lua',
    'config/shared.lua'
}

provide 'qb-mechanicjob'
lua54 'yes'
use_experimental_fxv2_oal 'yes'
fx_version 'cerulean'
game 'gta5'
version '1.1.1'

description 'gns_truckrobbery'
repository 'https://github.com/Genesis-project/gns_truckrobbery'
version '1.1.1'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
    'shared/types.lua',
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/main.lua',
}

server_script 'server/main.lua'

files {
    'config/client.lua',
    'config/shared.lua',
    'locales/*.json',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'

fx_version 'cerulean'
game 'gta5'

description 'gns_radialmenu'
repository 'https://github.com/Genesis-project/gns_radialmenu'
version '0.1.0'
ox_lib 'locale'


shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/*.lua',
}

server_scripts {
    'server/*.lua',
}

files {
    'config/client.lua',
    'locales/*.json',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'

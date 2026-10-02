fx_version 'cerulean'
game 'gta5'

description 'gns_houserobbery'
repository 'https://github.com/Genesis-project/gns_houserobbery'
version '1.0.0'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
}

server_scripts {
    'server/main.lua',
}

client_scripts {
    'client/main.lua'
}

files {
    'locales/*.json',
    'config/client.lua',
    'config/shared.lua',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'

fx_version 'cerulean'
game 'gta5'

description 'gns_recyclejob'
repository 'https://github.com/Genesis-project/gns_recyclejob'
version '2.1.0'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
}

server_scripts {
    'server/*',
}

client_scripts {
    'client/*'
}

files {
    'config/client.lua',
    'locales/*.json',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
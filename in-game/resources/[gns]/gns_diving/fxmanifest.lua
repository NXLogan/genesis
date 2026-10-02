fx_version 'cerulean'
game 'gta5'

description 'gns_diving'
repository 'https://github.com/Genesis-project/gns_diving'
version '1.1.1'

ox_lib 'locale'

shared_script {
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
    'config/shared.lua',
    'locales/*.json'
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'

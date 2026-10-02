fx_version 'cerulean'
game 'gta5'

description 'gns_jewelery'
repository 'https://github.com/Genesis-project/gns_jewelery'
version '1.0.0'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
}

client_script 'client/main.lua'

server_script 'server/main.lua'

files {
    'config/client.lua',
    'config/shared.lua',
    'locales/*.json',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
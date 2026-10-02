fx_version 'cerulean'
game 'gta5'

name 'gns_smallresources'
description 'Collection of small scripts'
repository 'https://github.com/Genesis-project/gns_smallresources'
version '0.2.0'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua'
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    '**/client.lua'
}

server_script '**/server.lua'

files {
    'locales/*.json',
    '**/config.json',
    '**/config.lua'
}

dependencies {
    'ox_lib',
    'gns_core'
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'

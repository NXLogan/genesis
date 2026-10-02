fx_version 'cerulean'
game 'gta5'

description 'GNS_NewsJob'
repository 'https://github.com/Genesis-project/gns_newsjob'
version '1.0.1'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/main.lua',
    'client/camera.lua'
}

server_script {
    'server/main.lua'
}

files {
    'config/client.lua',
    'locales/*.json',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
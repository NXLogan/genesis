fx_version 'cerulean'
game 'gta5'

description 'GNS_Carwash'
repository 'https://github.com/Genesis-project/gns_carwash'
version '1.0.0'

ox_lib 'locale'

shared_scripts {
	'@ox_lib/init.lua',
}

server_script 'server/main.lua'
client_scripts {
    '@gns_core/modules/lib.lua',
    'client/main.lua'
}

files {
    'locales/*.json',
    'config/client.lua',
    'config/shared.lua',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
fx_version 'cerulean'
game 'gta5'

description 'GNS_TruckerJob'
repository 'https://github.com/Genesis-project/gns_truckerjob'
version '1.0.0'

ox_lib 'locale'

shared_scripts {
	'@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
}

client_script {
	'@gns_core/modules/playerdata.lua',
	'client/main.lua',
}

server_script 'server/main.lua'

files {
	'locales/*.json',
	'config/client.lua',
	'config/shared.lua'
}

dependencies {
	'ox_lib'
}

provide 'qb-truckerjob'
lua54 'yes'
use_experimental_fxv2_oal 'yes'
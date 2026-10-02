fx_version 'cerulean'
game 'gta5'

description 'GNS_GarbageJob'
repository 'https://github.com/Genesis-project/gns_garbagejob'
version '1.0.0'

ox_lib 'locale'

shared_scripts {
	'@ox_lib/init.lua',
	'@gns_core/modules/lib.lua',
}

client_scripts {
	'@gns_core/modules/playerdata.lua',
	'client/main.lua'
}

server_script 'server/main.lua'

files {
	'locales/*.json',
	'config/client.lua',
	'config/shared.lua',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'

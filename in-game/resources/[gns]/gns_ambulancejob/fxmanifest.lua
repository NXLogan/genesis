fx_version 'cerulean'
game 'gta5'

description 'gns_ambulancejob'
repository 'https://github.com/Genesis-project/gns_ambulancejob'
version '1.0.0'

ox_lib 'locale'

dependencies {
    'gns_core',
	'gns_medical',
    'ox_lib',
	'ox_inventory'
}

shared_scripts {
	'@ox_lib/init.lua',
	'@gns_core/modules/lib.lua',
}

client_scripts {
	'@gns_core/modules/playerdata.lua',
	'@gns_medical/shared/main.lua',
	'client/*.lua',
}

server_scripts {
	'server/*.lua',
}

files {
	'locales/*.json',
	'config/client.lua',
	'config/shared.lua',
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
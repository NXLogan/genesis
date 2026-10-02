fx_version 'cerulean'
game 'gta5'

description 'GNS_TaxiJob'
repository 'https://github.com/Genesis-project/gns_taxijob'
version '1.0.0'

shared_scripts {
	'@ox_lib/init.lua',
	'@gns_core/modules/lib.lua'	
}

client_scripts {
	'@gns_core/modules/playerdata.lua',
	'client/main.lua',
}

server_script 'server/main.lua'

ui_page 'html/meter.html'

files {
	'html/meter.css',
	'html/meter.html',
	'html/meter.js',
	'config/client.lua',
	'config/shared.lua',
	'locales/*.json'
}

provide 'qb-taxijob'
lua54 'yes'
use_experimental_fxv2_oal 'yes'
ox_lib 'locale'
dependency 'gns_core'

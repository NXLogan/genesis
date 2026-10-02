fx_version 'cerulean'
game 'gta5'

name 'gns_policejob'
description 'Police system for Genesis'
repository 'https://github.com/Genesis-project/gns_policejob'
version '1.0.0'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua'
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/*.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/*.lua'
}

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/vue.min.js',
    'html/script.js',
    'html/fingerprint.png',
    'html/main.css',
    'config/client.lua',
    'config/shared.lua',
    'locales/*.json'
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
fx_version 'cerulean'
game 'gta5'

description 'gns_storerobbery'
repository 'https://github.com/Genesis-project/gns_storerobbery'
version '1.0.0'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
}

client_script 'client/main.lua'
server_script 'server/main.lua'

ui_page 'html/index.html'

files {
    'locales/*.json',
    'config/client.lua',
    'config/shared.lua',
    'html/index.html',
    'html/script.js',
    'html/style.css',
    'html/reset.css'
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'

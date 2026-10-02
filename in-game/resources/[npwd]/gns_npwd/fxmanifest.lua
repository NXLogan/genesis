fx_version 'cerulean'
game 'gta5'

description 'A simple bridge resource for Genesis Compatibility for NPWD'
version '1.0.0'
repository 'https://github.com/Genesis-Project/gns_npwd'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua'
}

client_script 'client.lua'

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server.lua'
}

lua54 'yes'
use_experimental_fxv2_oal 'yes'
provide 'qb-npwd'

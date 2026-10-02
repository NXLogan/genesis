fx_version 'cerulean'
game 'gta5'

description 'GNS_StreetRaces'
repository 'https://github.com/Genesis-project/gns_streetraces'
version '1.0.0'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua'

}
client_script 'client/main.lua'
server_script 'server/main.lua'

lua54 'yes'
use_experimental_fxv2_oal 'yes'
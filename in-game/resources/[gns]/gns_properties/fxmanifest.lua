fx_version 'cerulean'
game 'gta5'

name 'gns_properties'
description 'Hopefully one day a feature rich property system'
repository 'https://github.com/Genesis-project/gns_properties'
version '0.0.1'

ox_lib 'locale'

shared_scripts {
    '@ox_lib/init.lua',
    '@gns_core/modules/lib.lua',
    'shared/main.lua',
}

client_scripts {
    '@gns_core/modules/playerdata.lua',
    'client/apartmentselect.lua',
    'client/property.lua',
    'client/realtor.lua',
    'client/dataview.lua',
    'client/decorating.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/apartmentselect.lua',
    'server/property.lua',
    'server/realtor.lua',
    --'server/decorating.js' only used for taking screenshots of furniture
}

files {
    'config/client.lua',
    'config/shared.lua',
    'locales/*.json',
    'screenshots/*.webp'
}

lua54 'yes'
use_experimental_fxv2_oal 'true'
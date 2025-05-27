fx_version 'cerulean'
game 'gta5'

author 'Muffin'
description 'Fully Modular HUD System with QBCore Integration'
version '1.0.0'

ui_page 'html/index.html'

client_scripts {
    'client/main.lua',
    'client/config.lua',
    'client/seatbelt.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/database.lua'
}

shared_scripts {
    'shared/config.lua'
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/colorpicker.js',
}



dependencies {
    'qb-core',
    'oxmysql'
}

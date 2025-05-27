-- Database initialization
function InitializeDatabase()
    MySQL.ready(function()
        MySQL.Async.execute([[
            CREATE TABLE IF NOT EXISTS `player_hud_config` (
                `citizenid` VARCHAR(50) NOT NULL,
                `config` LONGTEXT NOT NULL,
                `settings` LONGTEXT DEFAULT NULL,
                `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (`citizenid`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ]], {}, function(result)
        end)
    end)
end

-- Save player HUD configuration and settings
function SavePlayerConfig(citizenid, config, settings)
    MySQL.Async.execute('INSERT INTO player_hud_config (citizenid, config, settings) VALUES (@citizenid, @config, @settings) ON DUPLICATE KEY UPDATE config = @config, settings = @settings', {
        ['@citizenid'] = citizenid,
        ['@config'] = json.encode(config),
        ['@settings'] = json.encode(settings or {})
    }, function(result)
        -- Config saved successfully
    end)
end

-- Load player HUD configuration and settings
function LoadPlayerConfig(citizenid, callback)
    MySQL.Async.fetchAll('SELECT config, settings FROM player_hud_config WHERE citizenid = @citizenid', {
        ['@citizenid'] = citizenid
    }, function(result)
        if result[1] then
            local config = json.decode(result[1].config)
            local settings = result[1].settings and json.decode(result[1].settings) or nil
            callback(config, settings)
        else
            callback(nil, nil)
        end
    end)
end

-- Initialize database on resource start
AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        InitializeDatabase()
    end
end)

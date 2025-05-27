local QBCore = exports['qb-core']:GetCoreObject()

-- Get player citizenid
function GetPlayerCitizenId(source)
    local Player = QBCore.Functions.GetPlayer(source)
    if Player then
        return Player.PlayerData.citizenid
    end
    return nil
end

-- Save player HUD configuration with settings
RegisterNetEvent('muffin_hud:saveConfig')
AddEventHandler('muffin_hud:saveConfig', function(config, settings)
    local source = source
    local citizenid = GetPlayerCitizenId(source)
    
    if citizenid then
        SavePlayerConfig(citizenid, config, settings or {})
    end
end)

-- Load player HUD configuration with settings
RegisterNetEvent('muffin_hud:loadConfig')
AddEventHandler('muffin_hud:loadConfig', function()
    local source = source
    local citizenid = GetPlayerCitizenId(source)
    
    if citizenid then
        LoadPlayerConfig(citizenid, function(config, settings)
            TriggerClientEvent('muffin_hud:configLoaded', source, config, settings)
        end)
    end
end)

-- Player connecting
AddEventHandler('playerConnecting', function()
    local source = source
end)

-- Player dropped
AddEventHandler('playerDropped', function(reason)
    local source = source
end)

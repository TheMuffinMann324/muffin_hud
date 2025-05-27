local QBCore = exports['qb-core']:GetCoreObject()
local hudVisible = true
local editMode = false
local playerData = {}
local playerLoaded = false
local isUnderwater = false
local infoElementsVisible = false
local hideInfoOnKeypress = false
local minimapVisible = true
local hideDefaultHUD = true
local mapOpen = false
local pauseMenuOpen = false
local inVehicle = false -- Add this new variable
local lastVehicleState = false -- Add this to track state changes

local isTalking = false
local isRadioTalking = false
local lastTalkingState = false
local lastRadioState = false

-- Wait for player to be loaded
RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    if not playerLoaded then
        -- Don't set playerLoaded here, let WaitForPlayerToLoad handle it
        -- Don't trigger config load here either
    end
end)

-- Register F9 keybind for toggling info elements
RegisterKeyMapping('togglehudinfo', 'Toggle HUD Info Elements', 'keyboard', 'F9')

-- Command for F9 key press - Toggle behavior
RegisterCommand('togglehudinfo', function()
    if hideInfoOnKeypress and not editMode then
        -- Toggle the visibility state
        infoElementsVisible = not infoElementsVisible
        
        SendNUIMessage({
            type = "toggleInfoElements",
            visible = infoElementsVisible
        })
    end
end, false)

-- Function to apply hide setting immediately
local function ApplyHideSetting()
    if hideInfoOnKeypress then
        -- If hide setting is enabled, hide info elements immediately
        infoElementsVisible = false
        SendNUIMessage({
            type = "toggleInfoElements",
            visible = false
        })
    else
        -- If hide setting is disabled, show info elements
        infoElementsVisible = true
        SendNUIMessage({
            type = "toggleInfoElements",
            visible = true
        })
    end
end

-- Function to toggle minimap
local function ToggleMinimap(visible)
    minimapVisible = visible
    DisplayRadar(visible)
    if visible then
        QBCore.Functions.Notify('Minimap Enabled', 'primary')
    else
        QBCore.Functions.Notify('Minimap Disabled', 'primary')
    end
end

-- Add this function to get direction from heading

local function GetDirection(heading)
    if heading >= 315 or heading < 45 then
        return "N"
    elseif heading >= 45 and heading < 135 then
        return "E"
    elseif heading >= 135 and heading < 225 then
        return "S"
    elseif heading >= 225 and heading < 315 then
        return "W"
    end
    return "N"
end

-- Function to detect talking state
local function UpdateTalkingState()
    -- Check if player is talking (using voice chat)
    local currentTalking = NetworkIsPlayerTalking(PlayerId())
    
    -- Check for radio talking (you may need to adjust this based on your radio script)
    local currentRadioTalking = false
    
    -- Common radio script integrations
    if GetResourceState('pma-voice') == 'started' then
        -- PMA Voice integration
        local radioChannel = LocalPlayer.state.radioChannel
        currentRadioTalking = radioChannel and radioChannel ~= 0 and currentTalking
    elseif GetResourceState('saltychat') == 'started' then
        -- SaltyChat integration
        currentRadioTalking = exports['saltychat']:IsPlayerUsingRadio() or false
    elseif GetResourceState('tokovoip_script') == 'started' then
        -- TokoVOIP integration  
        currentRadioTalking = exports['tokovoip_script']:isPlayerUsingRadio() or false
    elseif GetResourceState('mumble-voip') == 'started' then
        -- Mumble VOIP integration
        currentRadioTalking = exports['mumble-voip']:IsPlayerUsingRadio() or false
    end
    
    -- If no radio script detected but player is talking, assume regular voice
    if not currentRadioTalking and currentTalking then
        isTalking = true
        isRadioTalking = false
    elseif currentRadioTalking then
        isTalking = false
        isRadioTalking = true
    else
        isTalking = false
        isRadioTalking = false
    end
    
    -- Send updates if state changed
    if isTalking ~= lastTalkingState or isRadioTalking ~= lastRadioState then
        SendNUIMessage({
            type = "updateTalkingState",
            talking = isTalking,
            radioTalking = isRadioTalking
        })
        
        lastTalkingState = isTalking
        lastRadioState = isRadioTalking
    end
end

-- Initialize HUD data update loop
Citizen.CreateThread(function()
    while true do
        if hudVisible and playerLoaded then
            local playerPed = PlayerPedId()
            local PlayerData = QBCore.Functions.GetPlayerData()
            local playerId = GetPlayerServerId(PlayerId())
            
            -- Check if player is in vehicle
            local wasInVehicle = inVehicle
            inVehicle = IsPedInAnyVehicle(playerPed, false)
            
            -- Basic stats
            playerData.health = math.floor((GetEntityHealth(playerPed) - 100) / (GetEntityMaxHealth(playerPed) - 100) * 100)
            playerData.armor = GetPedArmour(playerPed)
            playerData.stamina = math.floor(100 - GetPlayerSprintStaminaRemaining(PlayerId()))
            
            -- City ID (Server ID)
            playerData.cityid = playerId
            
            -- Street and Direction Information
            local playerCoords = GetEntityCoords(playerPed)
            local streetHash, crossingHash = GetStreetNameAtCoord(playerCoords.x, playerCoords.y, playerCoords.z)
            local streetName = GetStreetNameFromHashKey(streetHash)
            local crossingName = GetStreetNameFromHashKey(crossingHash)
            local playerHeading = GetEntityHeading(playerPed)
            local direction = GetDirection(playerHeading)
            
            -- Format street display
            if crossingName and crossingName ~= "" and streetName ~= crossingName then
                playerData.street = streetName .. " & " .. crossingName
            else
                playerData.street = streetName or "Unknown Street"
            end
            
            playerData.direction = direction
            
            -- Vehicle data (only when in vehicle)
            if inVehicle then
                local vehicle = GetVehiclePedIsIn(playerPed, false)
                if vehicle and vehicle ~= 0 then
                    -- Speed conversion based on config
                    local speedMPS = GetEntitySpeed(vehicle) -- Speed in m/s
                    local speed = 0
                    
                    if Config.Elements.speedometer.speedUnit == "KPH" then
                        speed = speedMPS * 3.6 -- Convert m/s to km/h
                    else
                        speed = speedMPS * 2.236936 -- Convert m/s to mph
                    end
                    
                    playerData.speed = math.floor(speed)
                    playerData.speedUnit = Config.Elements.speedometer.speedUnit
                    
                    -- RPM (0.0 to 1.0 scale)
                    playerData.rpm = GetVehicleCurrentRpm(vehicle)
                    
                    -- Fuel
                    playerData.fuel = GetVehicleFuelLevel(vehicle) or 100
                    
                    -- Engine health (0-1000 scale, convert to percentage)
                    local engineHealth = GetVehicleEngineHealth(vehicle)
                    playerData.engineHealth = math.floor((engineHealth / 1000) * 100)
                    
                    -- Body health (0-1000 scale, convert to percentage)
                    local bodyHealth = GetVehicleBodyHealth(vehicle)
                    playerData.bodyHealth = math.floor((bodyHealth / 1000) * 100)
                    
                    -- Gear info
                    playerData.gear = GetVehicleCurrentGear(vehicle)
                    
                    -- Seatbelt status (now using integrated seatbelt system)
                    playerData.seatbelt = exports['muffin_hud']:GetSeatbeltStatus()
                end
            else
                -- Default values when not in vehicle
                playerData.speed = 0
                playerData.speedUnit = Config.Elements.speedometer.speedUnit
                playerData.rpm = 0
                playerData.fuel = 0
                playerData.engineHealth = 0
                playerData.bodyHealth = 0
                playerData.gear = 0
                playerData.seatbelt = false
            end
            
            -- Vehicle state changed - toggle speedometer visibility
            if wasInVehicle ~= inVehicle then
                SendNUIMessage({
                    type = "toggleSpeedometerVisibility",
                    visible = inVehicle
                })
            end
            
            -- Check if player is underwater
            local wasUnderwater = isUnderwater
            isUnderwater = IsPedSwimmingUnderWater(playerPed)
            
            -- Oxygen (only when underwater)
            if isUnderwater then
                playerData.oxygen = math.floor(GetPlayerUnderwaterTimeRemaining(PlayerId()) * 10)
                playerData.showOxygen = true
            else
                playerData.oxygen = 100
                playerData.showOxygen = false
            end
            
            -- If underwater status changed, update oxygen visibility
            if wasUnderwater ~= isUnderwater then
                SendNUIMessage({
                    type = "toggleOxygenVisibility",
                    visible = isUnderwater
                })
            end
            
            -- QBCore player data
            if PlayerData then
                -- Money (Cash)
                if PlayerData.money then
                    playerData.money = PlayerData.money.cash or 0
                    playerData.bank = PlayerData.money.bank or 0
                end
                
                -- Job with rank
                if PlayerData.job then
                    local jobLabel = PlayerData.job.label or "Unemployed"
                    local jobGrade = ""
                    
                    -- Get job grade/rank
                    if PlayerData.job.grade and PlayerData.job.grade.name then
                        jobGrade = PlayerData.job.grade.name
                    end
                    
                    -- Format job display
                    if jobGrade and jobGrade ~= "" and jobLabel ~= "Unemployed" then
                        playerData.job = jobLabel .. ": " .. jobGrade
                    else
                        playerData.job = jobLabel
                    end
                else
                    playerData.job = "Unemployed"
                end
                
                -- Stress (if available)
                if PlayerData.metadata and PlayerData.metadata.stress then
                    playerData.stress = math.floor(PlayerData.metadata.stress)
                else
                    playerData.stress = 0
                end
            end
            
            -- Update talking state
            UpdateTalkingState()
            
            -- Talking/Radio status
            playerData.talking = isTalking
            playerData.radioTalking = isRadioTalking
            
            -- Send updated data to NUI
            SendNUIMessage({
                type = "updateHUD",
                data = playerData
            })
        end
        Citizen.Wait(Config.Animation.updateInterval or 1000)
    end
end)

-- Initialize on resource start
AddEventHandler('onClientResourceStart', function(resourceName)
    if GetCurrentResourceName() == resourceName then
        Citizen.Wait(2000) -- Wait for everything to load
        
        -- Set NUI focus initially hidden
        SetNuiFocus(false, false)
        
        -- Initialize settings from config
        if Config.Settings then
            if Config.Settings.hideInfoOnKeypress then
                hideInfoOnKeypress = Config.Settings.hideInfoOnKeypress.enabled or false
            end
            if Config.Settings.minimapVisible then
                minimapVisible = Config.Settings.minimapVisible.enabled or true
            end
            if Config.Settings.hideDefaultHUD then
                hideDefaultHUD = Config.Settings.hideDefaultHUD.enabled or true
            end
        end
        
        -- Apply initial minimap state
        DisplayRadar(minimapVisible)
        
        -- Send initial config to NUI
        SendNUIMessage({
            type = "init",
            config = Config.Elements,
            settings = Config.Settings
        })
        
        -- Apply hide setting immediately after initialization
        Citizen.Wait(500) -- Small delay to ensure NUI is ready
        ApplyHideSetting()
        
        -- If player is already loaded, trigger config load
        if QBCore.Functions.GetPlayerData().citizenid then
            playerLoaded = true
            TriggerServerEvent('muffin_hud:loadConfig')
        end
    end
end)

-- Listen for QBCore events
RegisterNetEvent('QBCore:Client:OnJobUpdate', function(JobInfo)
    -- Job will be updated in next cycle with new rank info
end)

RegisterNetEvent('QBCore:Client:OnMoneyChange', function(type, amount, operation, reason)
    -- Money will be updated in next cycle
end)

RegisterNetEvent('hud:client:UpdateNeeds', function(hunger, thirst)
    -- Handle needs updates from other resources
    if hunger then playerData.hunger = math.floor(hunger) end
    if thirst then playerData.thirst = math.floor(thirst) end
end)

RegisterNetEvent('hud:client:UpdateStress', function(stress)
    playerData.stress = math.floor(stress or 0)
end)

-- Commands
RegisterCommand('togglehud', function()
    hudVisible = not hudVisible
    SendNUIMessage({
        type = "toggleVisibility",
        visible = hudVisible
    })
    QBCore.Functions.Notify(hudVisible and 'HUD Enabled' or 'HUD Disabled', 'primary')
end, false)

RegisterCommand('togglemap', function()
    minimapVisible = not minimapVisible
    ToggleMinimap(minimapVisible)
    
    -- Update the setting in config
    if Config.Settings and Config.Settings.minimapVisible then
        Config.Settings.minimapVisible.enabled = minimapVisible
    end
    SendNUIMessage({
        type = "updateSetting",
        setting = "minimapVisible",
        enabled = minimapVisible
    })
end, false)

RegisterCommand('hudmenu', function()
    if not playerLoaded then
        QBCore.Functions.Notify('Please wait for your character to fully load', 'error')
        return
    end
    
    editMode = not editMode
    SetNuiFocus(editMode, editMode)
    
    SendNUIMessage({
        type = "toggleEditMode",
        editMode = editMode
    })
    
    if editMode then
        QBCore.Functions.Notify('HUD Edit Mode: ON - Use ESC to close', 'primary')
    end
end, false)

RegisterCommand('savehud', function()
    SendNUIMessage({
        type = "getConfig"
    })
    QBCore.Functions.Notify('HUD Configuration Saved', 'success')
end, false)

RegisterCommand('resethud', function()
    SendNUIMessage({
        type = "resetConfig",
        config = Config.Elements,
        settings = Config.Settings
    })
    TriggerServerEvent('muffin_hud:saveConfig', Config.Elements, Config.Settings)
    QBCore.Functions.Notify('HUD Reset to Defaults', 'primary')
end, false)

RegisterCommand('squaremap', function()
    minimapLoaded = false -- Reset the flag
    minimapLoadAttempts = 0 -- Reset attempts
    TriggerEvent("muffin_hud:client:LoadMap", "square")
end, false)

RegisterCommand('circlemap', function()
    minimapLoaded = false -- Reset the flag
    minimapLoadAttempts = 0 -- Reset attempts
    TriggerEvent("muffin_hud:client:LoadMap", "circle")
end, false)

RegisterCommand('reloadmap', function()
    QBCore.Functions.Notify('Reloading minimap...', 'primary')
    minimapLoaded = false -- Reset the flag
    minimapLoadAttempts = 0 -- Reset attempts
    LoadMinimapOnce()
end, false)


-- NUI Callbacks
RegisterNUICallback('saveConfig', function(data, cb)
    -- Debug logging to verify shape data is included
    if data.config then
        for key, element in pairs(data.config) do
            if element.shape then
                print('[muffin_hud] Saving element', key, 'with shape:', element.shape)
            end
        end
    end
    
    TriggerServerEvent('muffin_hud:saveConfig', data.config, data.settings)
    QBCore.Functions.Notify('HUD Configuration Saved!', 'success')
    cb('ok')
end)

RegisterNUICallback('closeEditMode', function(data, cb)
    editMode = false
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('updateSettings', function(data, cb)
  
    if data.setting == 'hideInfoOnKeypress' then
        hideInfoOnKeypress = data.enabled
        ApplyHideSetting()
    elseif data.setting == 'minimapVisible' then
        minimapVisible = data.enabled
        ToggleMinimap(minimapVisible)
    elseif data.setting == 'hideDefaultHUD' then
        hideDefaultHUD = data.enabled
    end
    
    cb('ok')
end)

-- Server responses
RegisterNetEvent('muffin_hud:configLoaded')
AddEventHandler('muffin_hud:configLoaded', function(config, settings) 
    if config then
        SendNUIMessage({
            type = "loadConfig",
            config = config,
            settings = settings or Config.Settings
        })
        
        -- Apply settings
        local settingsToUse = settings or Config.Settings
        if settingsToUse then
            if settingsToUse.hideInfoOnKeypress then
                hideInfoOnKeypress = settingsToUse.hideInfoOnKeypress.enabled or false
            end
            if settingsToUse.minimapVisible then
                minimapVisible = settingsToUse.minimapVisible.enabled or true
                DisplayRadar(minimapVisible)
            end
            if settingsToUse.hideDefaultHUD then
                hideDefaultHUD = settingsToUse.hideDefaultHUD.enabled or true
            end
        else
            hideInfoOnKeypress = false
            minimapVisible = true
            hideDefaultHUD = true
        end
        
        -- Apply hide setting immediately after loading config
        Citizen.Wait(100) -- Small delay to ensure NUI has processed the config
        ApplyHideSetting()
    end
end)

-- Single minimap loading system
local minimapLoaded = false
local minimapLoadAttempts = 0

local function LoadMinimapOnce()
    -- Prevent multiple loading attempts
    if minimapLoaded or minimapLoadAttempts > 0 then

        return
    end
    
    minimapLoadAttempts = minimapLoadAttempts + 1

    -- Wait for player to be ready
    if not playerLoaded then
        while not playerLoaded do
            Citizen.Wait(500)
        end
    end
    
    -- Additional stability wait
    Citizen.Wait(2000)
    
     -- Load minimap textures
    local textureDicts = {"minimap", "squaremap", "circlemap"}
    
    for _, textureDict in ipairs(textureDicts) do
        if not HasStreamedTextureDictLoaded(textureDict) then
            RequestStreamedTextureDict(textureDict, false)
            
            local attempts = 0
            while not HasStreamedTextureDictLoaded(textureDict) and attempts < 50 do
                Citizen.Wait(100)
                attempts = attempts + 1
            end
        end
    end
    
    -- Final wait for texture stability
    Citizen.Wait(1000)
    
    -- Load the square map
    TriggerEvent("muffin_hud:client:LoadMap", "square")
    
    -- Mark as loaded
    minimapLoaded = true
end

-- Enhanced player loading detection with single minimap load
local function WaitForPlayerToLoad()
    -- Wait for QBCore to be ready
    while not QBCore do
        Citizen.Wait(100)
    end
    
    -- Wait for player data to be available
    local PlayerData = QBCore.Functions.GetPlayerData()
    while not PlayerData or not PlayerData.citizenid do
        Citizen.Wait(500)
        PlayerData = QBCore.Functions.GetPlayerData()
    end
    
    -- Wait for player to actually spawn in world
    while not NetworkIsPlayerActive(PlayerId()) do
        Citizen.Wait(100)
    end
    
    -- Additional wait to ensure everything is stable
    Citizen.Wait(1000)
    
    playerLoaded = true
    
    -- Load config and minimap once
    TriggerServerEvent('muffin_hud:loadConfig')
    
    -- Load minimap once after a small delay
    Citizen.Wait(500)
    LoadMinimapOnce()
    
    return true
end

-- Single initialization thread
Citizen.CreateThread(function()
    WaitForPlayerToLoad()
end)

-- Add this new thread to detect map and pause menu
Citizen.CreateThread(function()
    local wasMapOpen = false
    local wasPauseMenuOpen = false
    
    while true do
        Wait(100) -- Check every 100ms for better performance
        
        -- Check if map is open
        local isMapCurrentlyOpen = IsPauseMenuActive() and GetPauseMenuState() == 3
        
        -- Check if pause menu is open
        local isPauseMenuCurrentlyOpen = IsPauseMenuActive() and GetPauseMenuState() ~= 3
        
        -- Map state changed
        if isMapCurrentlyOpen ~= wasMapOpen then
            mapOpen = isMapCurrentlyOpen
            wasMapOpen = isMapCurrentlyOpen
            
            SendNUIMessage({
                type = "toggleMapOverlay",
                visible = not mapOpen -- Hide HUD when map is open
            })
        end
        
        -- Pause menu state changed
        if isPauseMenuCurrentlyOpen ~= wasPauseMenuOpen then
            pauseMenuOpen = isPauseMenuCurrentlyOpen
            wasPauseMenuOpen = isPauseMenuCurrentlyOpen
            
            SendNUIMessage({
                type = "togglePauseOverlay",
                visible = not pauseMenuOpen -- Hide HUD when pause menu is open
            })
        end
    end
end)

-- Listen for seatbelt changes
RegisterNetEvent('muffin_hud:seatbeltChanged')
AddEventHandler('muffin_hud:seatbeltChanged', function(status)
    -- Optional: Add any additional seatbelt change logic here
end)

RegisterNetEvent("muffin_hud:client:LoadMap", function(mapType)
    mapType = mapType or "square" -- Default to square map
    
    -- Don't load if player isn't ready
    if not playerLoaded then
        return -- Just return, don't retry automatically
    end 
    -- Reset any existing minimap settings first
    SetMinimapClipType(0)
    
    -- Clear any existing texture replacements
    ClearAllBrokenGlass()
    
    Wait(100)
    
    -- Credit to Dalrae for the solve.
    local defaultAspectRatio = 1920/1080 -- Don't change this.
    local resolutionX, resolutionY = GetActiveScreenResolution()
    local aspectRatio = resolutionX/resolutionY
    local minimapOffset = 0
    
    if aspectRatio > defaultAspectRatio then
        minimapOffset = ((defaultAspectRatio-aspectRatio)/3.6)-0.008
    end
    
    if mapType == "square" then
        -- Force request the texture dictionary
        RequestStreamedTextureDict("squaremap", false)
        
        local attempts = 0
        while not HasStreamedTextureDictLoaded("squaremap") and attempts < 100 do
            Wait(50)
            attempts = attempts + 1
        end
        
        if not HasStreamedTextureDictLoaded("squaremap") then
            QBCore.Functions.Notify('Failed to load square minimap texture', 'error')
            return
        end
        
        -- Apply square map settings
        SetMinimapClipType(0)
        
        -- Add texture replacements
        AddReplaceTexture("platform:/textures/graphics", "radarmasksm", "squaremap", "radarmasksm")
        AddReplaceTexture("platform:/textures/graphics", "radarmask1g", "squaremap", "radarmasksm")
        
        -- Position adjustments for square map
        SetMinimapComponentPosition("minimap", "L", "B", 0.0 + minimapOffset, -0.047, 0.1638, 0.183)
        SetMinimapComponentPosition("minimap_mask", "L", "B", 0.0 + minimapOffset, 0.0, 0.128, 0.20)
        SetMinimapComponentPosition('minimap_blur', 'L', 'B', -0.01 + minimapOffset, 0.025, 0.262, 0.300)
        
        -- Configure radar settings
        SetBlipAlpha(GetNorthRadarBlip(), 0)
        SetRadarBigmapEnabled(true, false)
        SetMinimapClipType(0)
        Wait(50)
        SetRadarBigmapEnabled(false, false)
        
        Wait(1200)
        
    elseif mapType == "circle" then
        -- Force request the texture dictionary
        RequestStreamedTextureDict("circlemap", false)
        
        local attempts = 0
        while not HasStreamedTextureDictLoaded("circlemap") and attempts < 100 do
            Wait(50)
            attempts = attempts + 1
        end      
        -- Apply circle map settings
        SetMinimapClipType(1)
        
        -- Add texture replacements
        AddReplaceTexture("platform:/textures/graphics", "radarmasksm", "circlemap", "radarmasksm")
        AddReplaceTexture("platform:/textures/graphics", "radarmask1g", "circlemap", "radarmasksm")
        
        -- Position adjustments for circle map
        SetMinimapComponentPosition("minimap", "L", "B", -0.0100 + minimapOffset, -0.030, 0.180, 0.258)
        SetMinimapComponentPosition("minimap_mask", "L", "B", 0.200 + minimapOffset, 0.0, 0.065, 0.20)
        SetMinimapComponentPosition('minimap_blur', 'L', 'B', -0.00 + minimapOffset, 0.015, 0.252, 0.338)
        
        -- Configure radar settings
        SetBlipAlpha(GetNorthRadarBlip(), 0)
        SetMinimapClipType(1)
        SetRadarBigmapEnabled(true, false)
        Wait(50)
        SetRadarBigmapEnabled(false, false)
        
        Wait(1200)
    end
end)

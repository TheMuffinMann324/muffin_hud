local QBCore = exports['qb-core']:GetCoreObject()

-- Seatbelt integration variables
local seatbeltOn = false
local lastSeatbeltState = false
local externalSeatbeltFound = false
local workingExport = nil
local playerInVehicle = false -- Add this new variable
local lastVehicleEntry = 0 -- Track when player entered vehicle

-- Check if external seatbelt script exists and is working
local function CheckExternalSeatbelt()
    if not Config.Seatbelt.enabled or not Config.Seatbelt.useExternalScript then
        return false
    end
    
    -- Check if the external script resource exists and is started
    local resourceState = GetResourceState(Config.Seatbelt.externalScriptName)
    if resourceState ~= 'started' then
        print('[muffin_hud] External seatbelt script not found:', Config.Seatbelt.externalScriptName)
        return false
    end
    
    -- Try to find a working export function
    for _, exportData in ipairs(Config.Seatbelt.exports) do
        if GetResourceState(exportData.resource) == 'started' then
            -- Test if the export function exists
            local success, result = pcall(function()
                return exports[exportData.resource][exportData.func]()
            end)
            
            if success then
                workingExport = exportData
                print('[muffin_hud] Found working seatbelt export:', exportData.resource, exportData.func)
                return true
            end
        end
    end
    
    print('[muffin_hud] No working seatbelt exports found, using event detection')
    return true -- Still try event detection even if exports don't work
end

-- Get seatbelt status from external script
local function GetExternalSeatbeltStatus()
    if not externalSeatbeltFound then
        -- If not in vehicle, return false (unbuckled)
        if not playerInVehicle then
            return false
        end
        return Config.Seatbelt.fallback.defaultState
    end
    
    -- Try using export function if we found one
    if workingExport then
        local success, result = pcall(function()
            return exports[workingExport.resource][workingExport.func]()
        end)
        
        if success and result ~= nil then
            return result
        end
    end
    
    -- Fallback to our tracked state from events
    return seatbeltOn
end

-- Initialize external seatbelt detection
Citizen.CreateThread(function()
    -- Wait a bit for other resources to load
    Citizen.Wait(2000)
    
    externalSeatbeltFound = CheckExternalSeatbelt()
    
    if externalSeatbeltFound then
        print('[muffin_hud] Successfully integrated with external seatbelt script')
    else
        print('[muffin_hud] No external seatbelt script found, using fallback')
    end
end)

-- Register event listeners for common seatbelt events
for _, eventName in ipairs(Config.Seatbelt.events) do
    RegisterNetEvent(eventName)
    AddEventHandler(eventName, function(status)
        if status ~= nil then
            -- Event provides status directly
            seatbeltOn = status
        else
            -- Event is just a toggle, flip the state
            seatbeltOn = not seatbeltOn
        end
        
        -- Notify HUD of change
        TriggerEvent('muffin_hud:seatbeltChanged', seatbeltOn)
    end)
end

-- Monitor seatbelt status changes and vehicle entry
Citizen.CreateThread(function()
    while true do
        local playerPed = PlayerPedId()
        local currentlyInVehicle = IsPedInAnyVehicle(playerPed, false)
        
        -- Check for vehicle entry/exit
        if currentlyInVehicle ~= playerInVehicle then
            playerInVehicle = currentlyInVehicle
            
            if currentlyInVehicle then
                -- Player just entered vehicle - seatbelt should be OFF
                lastVehicleEntry = GetGameTimer()
                seatbeltOn = false
                lastSeatbeltState = false
                
                -- Notify HUD immediately
                TriggerEvent('muffin_hud:seatbeltChanged', false)
                
                -- Small delay before checking external scripts to avoid conflicts
                Citizen.Wait(500)
            else
                -- Player exited vehicle - reset seatbelt
                seatbeltOn = false
                lastSeatbeltState = false
            end
        end
        
        -- Only check for seatbelt changes if in vehicle and some time has passed since entry
        if Config.Seatbelt.enabled and playerInVehicle and (GetGameTimer() - lastVehicleEntry) > 1000 then
            local currentState = GetExternalSeatbeltStatus()
            
            -- Check if state changed
            if currentState ~= lastSeatbeltState then
                seatbeltOn = currentState
                lastSeatbeltState = currentState
                
                -- Notify HUD of change
                TriggerEvent('muffin_hud:seatbeltChanged', seatbeltOn)
            end
        end
        
        Citizen.Wait(250) -- Check every 250ms for responsive detection
    end
end)

-- Export function to get seatbelt status for the HUD
function GetSeatbeltStatus()
    if not Config.Seatbelt.enabled then
        return true -- Default to buckled if disabled
    end
    
    -- If not in vehicle, always return false (unbuckled)
    if not playerInVehicle then
        return false
    end
    
    return GetExternalSeatbeltStatus()
end

-- Export function to set seatbelt status (for other scripts)
function SetSeatbeltStatus(status)
    seatbeltOn = status
    TriggerEvent('muffin_hud:seatbeltChanged', seatbeltOn)
end

-- Register exports for other scripts to use
exports('GetSeatbeltStatus', GetSeatbeltStatus)
exports('SetSeatbeltStatus', SetSeatbeltStatus)

-- Event handlers for other scripts
RegisterNetEvent('muffin_hud:getSeatbeltStatus')
AddEventHandler('muffin_hud:getSeatbeltStatus', function()
    return GetSeatbeltStatus()
end)

RegisterNetEvent('muffin_hud:setSeatbeltStatus')
AddEventHandler('muffin_hud:setSeatbeltStatus', function(status)
    SetSeatbeltStatus(status)
end)



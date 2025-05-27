Config = {}

-- Available icons for customization
Config.AvailableIcons = {
    health = {
        "fas fa-heart",
        "fas fa-heartbeat", 
        "fas fa-plus",
        "fas fa-plus-circle",
        "fas fa-user-md",
        "fas fa-first-aid",
        "fas fa-hospital",
        "fas fa-syringe"
    },
    armor = {
        "fas fa-shield-alt",
        "fas fa-shield",
        "fas fa-shield-halved",
        "fas fa-hard-hat",
        "fas fa-helmet-safety",
        "fas fa-user-shield",
        "fas fa-lock",
        "fas fa-lock-open"
    },
    hunger = {
        "fas fa-utensils",
        "fas fa-hamburger",
        "fas fa-pizza-slice",
        "fas fa-apple-whole",
        "fas fa-cookie-bite",
        "fas fa-drumstick-bite",
        "fas fa-bread-slice",
        "fas fa-cheese"
    },
    thirst = {
        "fas fa-droplet",
        "fas fa-wine-glass",
        "fas fa-coffee",
        "fas fa-mug-saucer",
        "fas fa-bottle-water",
        "fas fa-glass-water",
        "fas fa-faucet",
        "fas fa-beer-mug-empty"
    },
    stamina = {
        "fas fa-person-running",
        "fas fa-bolt",
        "fas fa-fire",
        "fas fa-dumbbell",
        "fas fa-running",
        "fas fa-shoe-prints",
        "fas fa-heart-pulse",
        "fas fa-gauge-high"
    },
    oxygen = {
        "fas fa-lungs",
        "fas fa-wind",
        "fas fa-cloud",
        "fas fa-fan",
        "fas fa-air-freshener",
        "fas fa-leaf",
        "fas fa-seedling",
        "fas fa-smog"
    },
    stress = {
        "fas fa-brain",
        "fas fa-head-side-virus",
        "fas fa-face-dizzy",
        "fas fa-face-tired",
        "fas fa-face-sad-tear",
        "fas fa-face-frown",
        "fas fa-face-meh",
        "fas fa-face-angry"
    },
    talking = {
        "fas fa-microphone",
        "fas fa-microphone-alt",
        "fas fa-volume-high",
        "fas fa-bullhorn",
        "fas fa-phone",
        "fas fa-headset",
        "fas fa-tower-broadcast",
        "fas fa-radio"
    }
}

-- Radio icons for talking element
Config.AvailableRadioIcons = {
    "fas fa-walkie-talkie",
    "fas fa-radio",
    "fas fa-tower-broadcast",
    "fas fa-tower-cell",
    "fas fa-signal",
    "fas fa-wifi",
    "fas fa-satellite",
    "fas fa-antenna-up"
}

-- HUD Elements Configuration
Config.Elements = {
    health = {
        name = "Health",
        icon = "fas fa-heart",
        defaultPosition = { x = 3, y = 1023 },
        defaultColor = "#FF4757",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 52, height = 52 },
        shape = "square",
        availableShapes = {"square", "rectangle", "circle", "rounded-square"},
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = true -- Allow icon customization
    },
    armor = {
        name = "Armor", 
        icon = "fas fa-shield-alt",
        defaultPosition = { x = 59, y = 1023 },
        defaultColor = "#3742FA",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 52, height = 52 },
        shape = "square",
        availableShapes = {"square", "rectangle", "circle", "rounded-square"},
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = true
    },
    hunger = {
        name = "Hunger",
        icon = "fas fa-utensils",
        defaultPosition = { x = 115, y = 1023 },
        defaultColor = "#FF6B35",
        defaultBackgroundColor = "#2C2C2C", 
        enabled = true,
        size = { width = 52, height = 52 },
        shape = "square",
        availableShapes = {"square", "rectangle", "circle", "rounded-square"},
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = true
    },
    thirst = {
        name = "Thirst",
        icon = "fas fa-tint",
        defaultPosition = { x = 170, y = 1023 },
        defaultColor = "#00D2FF",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 52, height = 52 },
        shape = "square",
        availableShapes = {"square", "rectangle", "circle", "rounded-square"},
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = true
    },
    stamina = {
        name = "Stamina",
        icon = "fas fa-running",
        defaultPosition = { x = 226, y = 1023 },
        defaultColor = "#2ED573",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 52, height = 52 },
        shape = "square",
        availableShapes = {"square", "rectangle", "circle", "rounded-square"},
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = true
    },
    oxygen = {
        name = "Oxygen",
        icon = "fas fa-lungs",
        defaultPosition = { x = 50, y = 1023 },
        defaultColor = "#00D2FF",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 52, height = 52 },
        shape = "square",
        availableShapes = {"square", "rectangle", "circle", "rounded-square"},
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = true
    },
    stress = {
        name = "Stress",
        icon = "fas fa-brain",
        defaultPosition = { x = 50, y = 1023 },
        defaultColor = "#E74C3C",
        defaultBackgroundColor = "#2C2C2C",
        enabled = false, -- Disabled by default
        size = { width = 52, height = 52 },
        shape = "square",
        availableShapes = {"square", "rectangle", "circle", "rounded-square"},
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = true
    },
    talking = {
        name = "Voice/Radio",
        icon = "fas fa-microphone",
        radioIcon = "fas fa-walkie-talkie",
        defaultPosition = { x = 282, y = 1023 },
        defaultColor = "#00D2FF",
        defaultRadioColor = "#FF6B35",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 52, height = 52 },
        shape = "square",
        availableShapes = {"square", "rectangle", "circle", "rounded-square"},
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = true
    },
    -- Non-customizable elements
    money = {
        name = "Money",
        icon = "fas fa-dollar-sign",
        defaultPosition = { x = 1773, y = 13 },
        defaultColor = "#2ED573",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 140, height = 45 },
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = false
    },
    bank = {
        name = "Bank",
        icon = "fas fa-university",
        defaultPosition = { x = 1773, y = 62 },
        defaultColor = "#3498DB",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 140, height = 45 },
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = false
    },
    job = {
        name = "Job",
        icon = "fas fa-briefcase",
        defaultPosition = { x = 1773, y = 112 },
        defaultColor = "#9B59B6",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 140, height = 45 },
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = false
    },
    cityid = {
        name = "Citizen ID",
        icon = "fas fa-id-card",
        defaultPosition = { x = 1630, y = 14 },
        defaultColor = "#E67E22",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 140, height = 45 },
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = false
    },
    street = {
        name = "Street",
        icon = "fas fa-road",
        defaultPosition = { x = 23, y = 786 },
        defaultColor = "#95A5A6",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 220, height = 32 },
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        customizable = false
    },
    speedometer = {
        name = "Speedometer",
        icon = "fas fa-tachometer-alt",
        defaultPosition = { x = 1635, y = 958 },
        defaultColor = "#4ECDC4",
        defaultBackgroundColor = "#2C2C2C",
        enabled = true,
        size = { width = 280, height = 120 },
        scale = 1.0,
        minScale = 0.5,
        maxScale = 2.0,
        speedUnit = "KPH",
        customizable = false
    }
}

-- Settings Configuration
Config.Settings = {
    hideInfoOnKeypress = {
        name = "Hide Info Elements (F9 to toggle)",
        description = "Hide money, bank, job, and city ID. Press F9 to toggle visibility",
        enabled = false,
        keybind = 160 -- F9 key code
    },
    minimapVisible = {
        name = "Minimap Visibility",
        description = "Show or hide the minimap. Use /togglemap command",
        enabled = true -- Minimap visible by default
    },
    hideDefaultHUD = {
        name = "Hide Default GTA HUD",
        description = "Hide default GTA health and armor bars",
        enabled = true -- Hide default bars by default
    }
}

-- Animation Settings
Config.Animation = {
    fadeInTime = 300,
    fadeOutTime = 200,
    updateInterval = 280
}

-- Database Settings  
Config.Database = {
    table = "player_hud_config"
}

-- Seatbelt Integration Settings
Config.Seatbelt = {
    enabled = true,
    useExternalScript = true, -- Use external seatbelt script instead of built-in
    externalScriptName = "qbx_seatbelt", -- Name of the seatbelt resource
    
    -- Event names that the external seatbelt script might use
    events = {
        -- QBX Seatbelt events
        "qbx_seatbelt:client:ToggleSeatbelt",
        "qbx_seatbelt:client:SeatbeltOn", 
        "qbx_seatbelt:client:SeatbeltOff",
        
        -- QB-SmallResources events
        "seatbelt:client:ToggleSeatbelt",
        "smallresources:client:SeatBelt",
        "qb-smallresources:client:SeatbeltOn",
        "qb-smallresources:client:SeatbeltOff",
        
        -- Other common seatbelt events
        "seatbelt:toggle",
        "seatbelt:on",
        "seatbelt:off",
        "vehicle:seatbelt"
    },
    
    -- Export functions to try
    exports = {
        {resource = "qbx_seatbelt", func = "GetSeatbeltStatus"},
        {resource = "qb-smallresources", func = "GetSeatbeltStatus"},
        {resource = "seatbelt", func = "isBuckled"},
        {resource = "vehicle", func = "getSeatbeltStatus"}
    },
    
    -- Fallback settings if no external script found
    fallback = {
        useBuiltIn = false, -- Set to true to use built-in seatbelt as fallback
        defaultState = true -- Default seatbelt state when no script found
    }
}



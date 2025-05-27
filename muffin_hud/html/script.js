// Main HUD JavaScript
class MuffinHUD {
    constructor() {
        this.config = {};
        this.settings = {};
        this.editMode = false;
        this.selectedElement = null;
        this.colorPicker = null;
        this.currentColorTarget = null;
        this.currentColorType = 'main';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initColorPicker();
    }

    setupEventListeners() {
        window.addEventListener('message', (event) => {
            const data = event.data;
            
            switch (data.type) {
                case 'init':
                    this.initializeHUD(data.config, data.settings);
                    break;
                case 'updateHUD':
                    this.updateHUDData(data.data);
                    break;
                case 'toggleVisibility':
                    this.toggleVisibility(data.visible);
                    break;
                case 'toggleEditMode':
                    this.toggleEditMode(data.editMode);
                    break;
                case 'loadConfig':
                    this.loadConfig(data.config, data.settings);
                    break;
                case 'resetConfig':
                    this.resetConfig(data.config, data.settings);
                    break;
                case 'getConfig':
                    this.saveConfig();
                    break;
                case 'toggleOxygenVisibility':
                    this.toggleOxygenVisibility(data.visible);
                    break;
                case 'toggleInfoElements':
                    this.toggleInfoElements(data.visible);
                    break;
                case 'toggleSpeedometerVisibility':
                    this.toggleSpeedometerVisibility(data.visible);
                    break;
                case 'toggleMapOverlay':
                    this.toggleMapOverlay(data.visible);
                    break;
                case 'togglePauseOverlay':
                    this.togglePauseOverlay(data.visible);
                    break;
                case 'updateTalkingState':
                    this.updateTalkingState(data.talking, data.radioTalking);
                    break;
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            this.setupMenuEventListeners();
        });
        
        if (document.readyState !== 'loading') {
            this.setupMenuEventListeners();
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!document.getElementById('color-picker-modal').classList.contains('hidden')) {
                    this.closeColorPicker();
                } else if (this.editMode) {
                    this.closeEditMode();
                }
            }
        });
    }

    setupMenuEventListeners() {
        const closeEditBtn = document.getElementById('close-edit');
        if (closeEditBtn) {
            closeEditBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeEditMode();
            });
        }

        const saveConfigBtn = document.getElementById('save-config');
        if (saveConfigBtn) {
            saveConfigBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.saveConfig();
                this.closeEditMode();
            });
        }

        const resetConfigBtn = document.getElementById('reset-config');
        if (resetConfigBtn) {
            resetConfigBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.resetToDefaults();
            });
        }

        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeColorPicker();
            });
        }

        const applyColorBtn = document.getElementById('apply-color');
        if (applyColorBtn) {
            applyColorBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.applySelectedColor();
            });
        }

        document.querySelectorAll('.preset-color').forEach(preset => {
            preset.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const color = preset.getAttribute('data-color');
                document.getElementById('color-hex').value = color;
                if (this.currentColorTarget) {
                    this.applyColor(this.currentColorTarget, color, this.currentColorType);
                }
                this.closeColorPicker();
            });
        });
    }

    initColorPicker() {
        const colorPickerContainer = document.getElementById('color-picker');
        if (colorPickerContainer) {
            this.colorPicker = new ColorPicker(colorPickerContainer);
            
            this.colorPicker.setCallback((color) => {
                const colorHexInput = document.getElementById('color-hex');
                if (colorHexInput) {
                    colorHexInput.value = color;
                }
            });
        }
    }

    initializeHUD(config, settings) {
        this.config = { ...config };
        this.settings = { ...settings };
        
        window.Config = {
            AvailableIcons: {
                health: ["fas fa-heart", "fas fa-heartbeat", "fas fa-plus", "fas fa-plus-circle", "fas fa-user-md", "fas fa-first-aid", "fas fa-hospital", "fas fa-syringe"],
                armor: ["fas fa-shield-alt", "fas fa-shield", "fas fa-shield-halved", "fas fa-hard-hat", "fas fa-helmet-safety", "fas fa-user-shield", "fas fa-lock", "fas fa-lock-open"],
                hunger: ["fas fa-utensils", "fas fa-hamburger", "fas fa-pizza-slice", "fas fa-apple-whole", "fas fa-cookie-bite", "fas fa-drumstick-bite", "fas fa-bread-slice", "fas fa-cheese"],
                thirst: ["fas fa-droplet", "fas fa-wine-glass", "fas fa-coffee", "fas fa-mug-saucer", "fas fa-bottle-water", "fas fa-glass-water", "fas fa-faucet", "fas fa-beer-mug-empty"],
                stamina: ["fas fa-person-running", "fas fa-bolt", "fas fa-fire", "fas fa-dumbbell", "fas fa-running", "fas fa-shoe-prints", "fas fa-heart-pulse", "fas fa-gauge-high"],
                oxygen: ["fas fa-lungs", "fas fa-wind", "fas fa-cloud", "fas fa-fan", "fas fa-air-freshener", "fas fa-leaf", "fas fa-seedling", "fas fa-smog"],
                stress: ["fas fa-brain", "fas fa-head-side-virus", "fas fa-face-dizzy", "fas fa-face-tired", "fas fa-face-sad-tear", "fas fa-face-frown", "fas fa-face-meh", "fas fa-face-angry"],
                talking: ["fas fa-microphone", "fas fa-microphone-alt", "fas fa-volume-high", "fas fa-bullhorn", "fas fa-phone", "fas fa-headset", "fas fa-tower-broadcast", "fas fa-radio"]
            },
            AvailableRadioIcons: ["fas fa-walkie-talkie", "fas fa-radio", "fas fa-tower-broadcast", "fas fa-tower-cell", "fas fa-signal", "fas fa-wifi", "fas fa-satellite", "fas fa-antenna-up"]
        };
        
        this.createHUDElements();
        this.createElementToggles();
        this.createSettingsToggles();
        
        if (this.settings && this.settings.hideInfoOnKeypress && this.settings.hideInfoOnKeypress.enabled) {
            setTimeout(() => {
                this.toggleInfoElements(false);
            }, 100);
        }
    }

    loadConfig(config, settings) {
        this.config = { ...config };
        this.settings = { ...settings };
        
        window.Config = {
            AvailableIcons: {
                health: ["fas fa-heart", "fas fa-heartbeat", "fas fa-plus", "fas fa-plus-circle", "fas fa-user-md", "fas fa-first-aid", "fas fa-hospital", "fas fa-syringe"],
                armor: ["fas fa-shield-alt", "fas fa-shield", "fas fa-shield-halved", "fas fa-hard-hat", "fas fa-helmet-safety", "fas fa-user-shield", "fas fa-lock", "fas fa-lock-open"],
                hunger: ["fas fa-utensils", "fas fa-hamburger", "fas fa-pizza-slice", "fas fa-apple-whole", "fas fa-cookie-bite", "fas fa-drumstick-bite", "fas fa-bread-slice", "fas fa-cheese"],
                thirst: ["fas fa-droplet", "fas fa-wine-glass", "fas fa-coffee", "fas fa-mug-saucer", "fas fa-bottle-water", "fas fa-glass-water", "fas fa-faucet", "fas fa-beer-mug-empty"],
                stamina: ["fas fa-person-running", "fas fa-bolt", "fas fa-fire", "fas fa-dumbbell", "fas fa-running", "fas fa-shoe-prints", "fas fa-heart-pulse", "fas fa-gauge-high"],
                oxygen: ["fas fa-lungs", "fas fa-wind", "fas fa-cloud", "fas fa-fan", "fas fa-air-freshener", "fas fa-leaf", "fas fa-seedling", "fas fa-smog"],
                stress: ["fas fa-brain", "fas fa-head-side-virus", "fas fa-face-dizzy", "fas fa-face-tired", "fas fa-face-sad-tear", "fas fa-face-frown", "fas fa-face-meh", "fas fa-face-angry"],
                talking: ["fas fa-microphone", "fas fa-microphone-alt", "fas fa-volume-high", "fas fa-bullhorn", "fas fa-phone", "fas fa-headset", "fas fa-tower-broadcast", "fas fa-radio"]
            },
            AvailableRadioIcons: ["fas fa-walkie-talkie", "fas fa-radio", "fas fa-tower-broadcast", "fas fa-tower-cell", "fas fa-signal", "fas fa-wifi", "fas fa-satellite", "fas fa-antenna-up"]
        };
        
        this.createHUDElements();
        this.createElementToggles();
        this.createSettingsToggles();
        
        if (this.settings && this.settings.hideInfoOnKeypress && this.settings.hideInfoOnKeypress.enabled) {
            setTimeout(() => {
                this.toggleInfoElements(false);
            }, 100);
        }
    }

    toggleInfoElements(visible) {
        const infoElements = ['money', 'bank', 'job', 'cityid'];
        
        infoElements.forEach(elementKey => {
            const element = document.getElementById(`hud-${elementKey}`);
            if (element && this.config[elementKey] && this.config[elementKey].enabled) {
                if (visible) {
                    element.style.display = 'flex';
                    element.classList.remove('fade-out');
                    element.classList.add('fade-in');
                    setTimeout(() => {
                        element.classList.remove('fade-in');
                    }, 300);
                } else {
                    element.classList.remove('fade-in');
                    element.classList.add('fade-out');
                    setTimeout(() => {
                        element.style.display = 'none';
                        element.classList.remove('fade-out');
                    }, 200);
                }
            }
        });
    }

    createHUDElements() {
        const container = document.getElementById('hud-container');
        container.innerHTML = '';

        Object.keys(this.config).forEach(key => {
            const element = this.config[key];
            if (element.enabled) {
                this.createElement(key, element);
            }
        });
    }

    toggleOxygenVisibility(visible) {
        const oxygenElement = document.getElementById('hud-oxygen');
        if (oxygenElement) {
            if (visible) {
                oxygenElement.style.display = 'block';
                oxygenElement.classList.add('fade-in');
                setTimeout(() => {
                    oxygenElement.classList.remove('fade-in');
                }, 300);
            } else {
                oxygenElement.classList.add('fade-out');
                setTimeout(() => {
                    oxygenElement.style.display = 'none';
                    oxygenElement.classList.remove('fade-out');
                }, 200);
            }
        }
    }

    toggleSpeedometerVisibility(visible) {
        const speedometerElement = document.getElementById('hud-speedometer');
        if (speedometerElement && this.config.speedometer && this.config.speedometer.enabled) {
            if (visible) {
                speedometerElement.style.display = 'block';
                speedometerElement.classList.add('fade-in');
                setTimeout(() => {
                    speedometerElement.classList.remove('fade-in');
                }, 300);
            } else {
                speedometerElement.classList.add('fade-out');
                setTimeout(() => {
                    speedometerElement.style.display = 'none';
                    speedometerElement.classList.remove('fade-out');
                }, 200);
            }
        }
    }

    createElement(key, element) {
        const container = document.getElementById('hud-container');
        const hudElement = document.createElement('div');
        
        hudElement.className = 'hud-element';
        hudElement.id = `hud-${key}`;
        
        let positionX = element.position?.x || element.defaultPosition.x;
        let positionY = element.position?.y || element.defaultPosition.y;
        
        hudElement.style.left = `${positionX}px`;
        hudElement.style.top = `${positionY}px`;

        const scale = element.scale || 1.0;
        hudElement.setAttribute('data-scale', scale);
        hudElement.style.transform = `scale(${scale})`;
        hudElement.style.transformOrigin = 'top left';

        if (key === 'oxygen' || key === 'speedometer') {
            hudElement.style.display = 'none';
        }

        if (key === 'talking') {
            hudElement.style.display = 'block';
        }

        if (['health', 'armor', 'hunger', 'thirst', 'stamina', 'oxygen', 'stress', 'talking'].includes(key)) {
            const progressBox = document.createElement('div');
            progressBox.className = 'progress-box';
            progressBox.style.backgroundColor = element.defaultBackgroundColor || '#2C2C2C';
            
            const shape = element.shape || 'square';
            progressBox.classList.add(`shape-${shape}`);
            
            if (shape === 'rectangle') {
                hudElement.style.width = '80px';
                hudElement.style.height = '32px';
            } else {
                hudElement.style.width = `${element.size.width}px`;
                hudElement.style.height = `${element.size.height}px`;
            }
            
            const progressFill = document.createElement('div');
            progressFill.className = `progress-box-fill shape-${shape}`;
            progressFill.style.backgroundColor = element.color || element.defaultColor;
            
            if (key === 'talking') {
                progressFill.style.height = '0%';
                progressFill.style.opacity = '0';
            } else {
                progressFill.style.height = '100%';
            }
            
            const icon = document.createElement('i');
            let iconClass = element.icon;
            if (!this.validateIcon(iconClass)) {
                const fallbackIcons = {
                    health: 'fas fa-heart',
                    armor: 'fas fa-shield',
                    hunger: 'fas fa-utensils',
                    thirst: 'fas fa-droplet',
                    stamina: 'fas fa-bolt',
                    oxygen: 'fas fa-lungs',
                    stress: 'fas fa-brain',
                    talking: 'fas fa-microphone'
                };
                iconClass = fallbackIcons[key] || 'fas fa-question';
            }
            
            icon.className = `progress-box-icon ${iconClass}`;
            icon.style.fontSize = `${16 * scale}px`;
            
            if (key === 'talking') {
                const radioIcon = document.createElement('i');
                let radioIconClass = element.radioIcon || 'fas fa-radio';
                if (!this.validateIcon(radioIconClass)) {
                    radioIconClass = 'fas fa-radio';
                }
                radioIcon.className = `progress-box-icon radio-icon ${radioIconClass}`;
                radioIcon.style.display = 'none';
                radioIcon.style.fontSize = `${16 * scale}px`;
                progressBox.appendChild(radioIcon);
            }
            
            progressBox.appendChild(progressFill);
            progressBox.appendChild(icon);
            hudElement.appendChild(progressBox);
            
        } else if (key === 'street') {
            hudElement.className += ' street-element';
            hudElement.style.width = `${element.size.width}px`;
            hudElement.style.height = `${element.size.height}px`;
            
            const streetIcon = document.createElement('i');
            streetIcon.className = `element-icon ${element.icon}`;
            streetIcon.style.color = element.color || element.defaultColor;
            streetIcon.style.fontSize = `${16 * scale}px`;

            const streetInfo = document.createElement('div');
            streetInfo.className = 'street-info';
            streetInfo.style.fontSize = `${14 * scale}px`;
            
            const streetName = document.createElement('span');
            streetName.className = 'street-name';
            streetName.textContent = 'Unknown Street';
            
            const directionIcon = document.createElement('span');
            directionIcon.className = 'direction-icon';
            directionIcon.textContent = 'N';
            directionIcon.style.fontSize = `${12 * scale}px`;
            
            streetInfo.appendChild(streetName);
            streetInfo.appendChild(directionIcon);
            
            hudElement.appendChild(streetIcon);
            hudElement.appendChild(streetInfo);
            
        } else if (key === 'speedometer') {
            hudElement.className += ' speedometer-element clean-layout-speedo';
            hudElement.style.width = `${element.size.width}px`;
            hudElement.style.height = `${element.size.height}px`;
            
            const speedoContainer = document.createElement('div');
            speedoContainer.className = 'clean-speedo-container';
            
            const topRow = document.createElement('div');
            topRow.className = 'speedo-top-row';
            
            const speedUnit = document.createElement('div');
            speedUnit.className = 'speed-unit';
            speedUnit.textContent = 'KPH';
            speedUnit.style.fontSize = `${12 * scale}px`;
            
            const speedValue = document.createElement('div');
            speedValue.className = 'speed-value';
            speedValue.textContent = '0';
            speedValue.style.fontSize = `${36 * scale}px`;
            
            const gearBox = document.createElement('div');
            gearBox.className = 'gear-display';
            
            const gearLabel = document.createElement('div');
            gearLabel.className = 'gear-label';
            gearLabel.textContent = 'GEAR';
            gearLabel.style.fontSize = `${8 * scale}px`;
            
            const gearValue = document.createElement('div');
            gearValue.className = 'gear-value';
            gearValue.textContent = '1';
            gearValue.style.fontSize = `${14 * scale}px`;
            
            gearBox.appendChild(gearLabel);
            gearBox.appendChild(gearValue);
            
            topRow.appendChild(speedUnit);
            topRow.appendChild(speedValue);
            topRow.appendChild(gearBox);
            
            const middleRow = document.createElement('div');
            middleRow.className = 'speedo-middle-row';
            
            const fuelIcon = document.createElement('i');
            fuelIcon.className = 'fas fa-gas-pump fuel-icon';
            fuelIcon.style.fontSize = `${14 * scale}px`;
            
            const fuelBar = document.createElement('div');
            fuelBar.className = 'fuel-bar';
            fuelBar.style.height = `${6 * scale}px`;
            
            const fuelFill = document.createElement('div');
            fuelFill.className = 'fuel-fill';
            fuelFill.style.width = '100%';
            
            fuelBar.appendChild(fuelFill);
            
            middleRow.appendChild(fuelIcon);
            middleRow.appendChild(fuelBar);
            
            const bottomRow = document.createElement('div');
            bottomRow.className = 'speedo-bottom-row';
            
            const seatbeltIcon = document.createElement('i');
            seatbeltIcon.className = 'fas fa-user-slash seatbelt-icon';
            seatbeltIcon.style.fontSize = `${14 * scale}px`;
            
            const engineIcon = document.createElement('i');
            engineIcon.className = 'fas fa-cog engine-icon';
            engineIcon.style.fontSize = `${14 * scale}px`;
            
            const nosIcon = document.createElement('i');
            nosIcon.className = 'fas fa-fire nos-icon';
            nosIcon.style.fontSize = `${14 * scale}px`;
            
            bottomRow.appendChild(seatbeltIcon);
            bottomRow.appendChild(engineIcon);
            bottomRow.appendChild(nosIcon);
            
            speedoContainer.appendChild(topRow);
            speedoContainer.appendChild(middleRow);
            speedoContainer.appendChild(bottomRow);
            
            hudElement.appendChild(speedoContainer);
        } else {
            hudElement.className += ` ${key}-element`;
            hudElement.style.width = `${element.size.width}px`;
            hudElement.style.height = `${element.size.height}px`;
            
            const icon = document.createElement('i');
            icon.className = `element-icon ${element.icon}`;
            icon.style.color = element.color || element.defaultColor;
            icon.style.fontSize = `${16 * scale}px`;

            const value = document.createElement('span');
            value.className = `${key}-value`;
            value.style.fontSize = `${14 * scale}px`;
            
            // Set default text based on element type
            if (key === 'money') {
                value.textContent = '$0';
            } else if (key === 'bank') {
                value.textContent = '$0';
            } else if (key === 'job') {
                value.textContent = 'Unemployed';
            } else if (key === 'cityid') {
                value.textContent = 'ID: 0';
            }
            
            hudElement.appendChild(icon);
            hudElement.appendChild(value);
        }

        // Add event listeners for edit mode
        hudElement.addEventListener('click', (e) => {
            if (this.editMode) {
                e.stopPropagation();
                this.selectElement(key);
            }
        });

        // Add drag functionality
        this.makeDraggable(hudElement, key);

        container.appendChild(hudElement);
    }

    makeDraggable(element, key) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        element.addEventListener('mousedown', (e) => {
            if (!this.editMode) return;
            
            isDragging = true;
            element.classList.add('dragging');
            
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(element.style.left);
            startTop = parseInt(element.style.top);
            
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !this.editMode) return;
            
            const scale = this.config[key]?.scale || 1.0;
            
            const newLeft = startLeft + (e.clientX - startX);
            const newTop = startTop + (e.clientY - startY);
            
            const scaledWidth = element.offsetWidth * scale;
            const scaledHeight = element.offsetHeight * scale;
            const maxX = window.innerWidth - scaledWidth;
            const maxY = window.innerHeight - scaledHeight;
            
            element.style.left = `${Math.max(0, Math.min(newLeft, maxX))}px`;
            element.style.top = `${Math.max(0, Math.min(newTop, maxY))}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.classList.remove('dragging');
                
                if (this.config[key]) {
                    this.config[key].position = {
                        x: parseInt(element.style.left),
                        y: parseInt(element.style.top)
                    };
                }
            }
        });
    }

    createElementToggles() {
        const container = document.getElementById('element-toggles');
        if (!container) return;
        
        container.innerHTML = '';

        Object.keys(this.config).forEach(key => {
            const element = this.config[key];
            const toggle = document.createElement('div');
            toggle.className = 'element-toggle';

            const label = document.createElement('div');
            label.className = 'element-toggle-label';
            
            const icon = document.createElement('i');
            icon.className = element.icon;
            icon.style.color = element.color || element.defaultColor;
            
            const text = document.createElement('span');
            text.textContent = element.name;
            
            label.appendChild(icon);
            label.appendChild(text);

            const switchElement = document.createElement('div');
            switchElement.className = `toggle-switch ${element.enabled ? 'active' : ''}`;
            
            switchElement.addEventListener('click', () => {
                element.enabled = !element.enabled;
                switchElement.classList.toggle('active', element.enabled);
                
                if (element.enabled) {
                    this.createElement(key, element);
                } else {
                    const hudElement = document.getElementById(`hud-${key}`);
                    if (hudElement) {
                        hudElement.remove();
                    }
                }
                
                // Special handling for talking element - ensure it shows when re-enabled
                if (key === 'talking' && element.enabled) {
                    const talkingElement = document.getElementById(`hud-${key}`);
                    if (talkingElement) {
                        talkingElement.style.display = 'block';
                    }
                }
            });

            toggle.appendChild(label);
            toggle.appendChild(switchElement);
            container.appendChild(toggle);
        });
    }

    createSettingsToggles() {
        const container = document.getElementById('settings-toggles');
        if (!container) return;
        
        container.innerHTML = '';

        if (!this.settings) return;

        // Filter out the hideDefaultHUD setting
        Object.keys(this.settings).forEach(key => {
            // Skip the hideDefaultHUD setting
            if (key === 'hideDefaultHUD') return;
            
            const setting = this.settings[key];
            const toggle = document.createElement('div');
            toggle.className = 'setting-toggle';

            const label = document.createElement('div');
            label.className = 'setting-toggle-label';
            
            const title = document.createElement('span');
            title.className = 'setting-title';
            title.textContent = setting.name;
            
            const description = document.createElement('span');
            description.className = 'setting-description';
            description.textContent = setting.description;
            
            label.appendChild(title);
            label.appendChild(description);

            const switchElement = document.createElement('div');
            switchElement.className = `toggle-switch ${setting.enabled ? 'active' : ''}`;
            
            switchElement.addEventListener('click', () => {
                setting.enabled = !setting.enabled;
                switchElement.classList.toggle('active', setting.enabled);
                
                // Send update to client
                fetch(`https://${GetParentResourceName()}/updateSettings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        setting: key, 
                        enabled: setting.enabled 
                    })
                }).catch(err => {
                    // Silent error handling
                });
            });

            toggle.appendChild(label);
            toggle.appendChild(switchElement);
            container.appendChild(toggle);
        });
    }

    updateHUDData(data) {
        const progressElements = ['health', 'armor', 'hunger', 'thirst', 'stamina', 'oxygen', 'stress'];
        
        progressElements.forEach(elementKey => {
            const element = document.getElementById(`hud-${elementKey}`);
            if (element && this.config[elementKey] && this.config[elementKey].enabled) {
                const progressFill = element.querySelector('.progress-box-fill');
                if (progressFill && data[elementKey] !== undefined) {
                    const value = Math.max(0, Math.min(100, data[elementKey]));
                    progressFill.style.height = `${value}%`;
                }
            }
        });

        ['money', 'bank', 'job', 'cityid'].forEach(elementKey => {
            const element = document.getElementById(`hud-${elementKey}`);
            if (element && this.config[elementKey] && this.config[elementKey].enabled) {
                const valueElement = element.querySelector(`.${elementKey}-value`);
                if (valueElement && data[elementKey] !== undefined) {
                    if (elementKey === 'money' || elementKey === 'bank') {
                        const amount = data[elementKey];
                        if (amount >= 10000) {
                            valueElement.textContent = `$${this.formatMoney(amount)}`;
                        } else {
                            valueElement.textContent = `$${this.formatNumber(amount)}`;
                        }
                    } else if (elementKey === 'cityid') {
                        valueElement.textContent = `ID: ${data[elementKey]}`;
                    } else {
                        valueElement.textContent = data[elementKey];
                    }
                }
            }
        });

        const streetElement = document.getElementById('hud-street');
        if (streetElement && this.config.street && this.config.street.enabled) {
            const streetName = streetElement.querySelector('.street-name');
            const directionIcon = streetElement.querySelector('.direction-icon');
            
            if (streetName && data.street !== undefined) {
                streetName.textContent = data.street;
                
                if (data.street.length > 25) {
                    streetName.setAttribute('data-long', 'true');
                } else {
                    streetName.removeAttribute('data-long');
                }
            }
            
            if (directionIcon && data.direction !== undefined) {
                directionIcon.textContent = data.direction;
            }
        }

        const speedometerElement = document.getElementById('hud-speedometer');
        if (speedometerElement && this.config.speedometer && this.config.speedometer.enabled) {
            const speedValue = speedometerElement.querySelector('.speed-value');
            const speedUnit = speedometerElement.querySelector('.speed-unit');
            const gearValue = speedometerElement.querySelector('.gear-value');
            const gearBox = speedometerElement.querySelector('.gear-display');
            const fuelFill = speedometerElement.querySelector('.fuel-fill');
            const seatbeltIcon = speedometerElement.querySelector('.seatbelt-icon');
            const engineIcon = speedometerElement.querySelector('.engine-icon');
            const nosIcon = speedometerElement.querySelector('.nos-icon');
            
            if (speedValue && data.speed !== undefined) {
                speedValue.textContent = data.speed;
                
                if (data.speed > 120) {
                    speedValue.setAttribute('data-speed', 'high');
                } else if (data.speed > 80) {
                    speedValue.setAttribute('data-speed', 'medium');
                } else {
                    speedValue.removeAttribute('data-speed');
                }
            }
            
            if (speedUnit && data.speedUnit !== undefined) {
                speedUnit.textContent = data.speedUnit;
            }
            
            if (gearValue && gearBox && data.gear !== undefined) {
                gearValue.textContent = data.gear === 0 ? 'R' : data.gear;
                
                if (data.gear === 0) {
                    gearBox.classList.add('reverse');
                } else {
                    gearBox.classList.remove('reverse');
                }
            }
            
            if (fuelFill && data.fuel !== undefined) {
                const fuelPercent = Math.max(0, Math.min(100, data.fuel));
                fuelFill.style.width = `${fuelPercent}%`;
                
                if (data.fuel < 15) {
                    fuelFill.setAttribute('data-status', 'critical');
                } else if (data.fuel < 30) {
                    fuelFill.setAttribute('data-status', 'warning');
                } else {
                    fuelFill.removeAttribute('data-status');
                }
            }
            
            if (seatbeltIcon && data.seatbelt !== undefined) {
                if (data.seatbelt === true) {
                    seatbeltIcon.style.opacity = '0.6';
                    seatbeltIcon.classList.remove('warning');
                    seatbeltIcon.style.color = '#2ECC71';
                    seatbeltIcon.style.background = 'rgba(46, 204, 113, 0.1)';
                    seatbeltIcon.style.borderColor = 'rgba(46, 204, 113, 0.2)';
                    seatbeltIcon.style.boxShadow = 'none';
                } else {
                    seatbeltIcon.style.opacity = '1';
                    seatbeltIcon.classList.add('warning');
                    seatbeltIcon.style.color = '#FF6B6B';
                    seatbeltIcon.style.background = 'rgba(255, 107, 107, 0.15)';
                    seatbeltIcon.style.borderColor = 'rgba(255, 107, 107, 0.4)';
                }
            } else if (seatbeltIcon) {
                seatbeltIcon.style.opacity = '1';
                seatbeltIcon.classList.add('warning');
                seatbeltIcon.style.color = '#FF6B6B';
                seatbeltIcon.style.background = 'rgba(255, 107, 107, 0.15)';
                seatbeltIcon.style.borderColor = 'rgba(255, 107, 107, 0.4)';
            }
            
            if (engineIcon && data.engineHealth !== undefined) {
                if (data.engineHealth < 25) {
                    engineIcon.setAttribute('data-status', 'critical');
                } else if (data.engineHealth < 50) {
                    engineIcon.setAttribute('data-status', 'warning');
                } else {
                    engineIcon.removeAttribute('data-status');
                }
            }
            
            if (nosIcon && data.nos !== undefined) {
                if (data.nos > 0) {
                    nosIcon.style.opacity = '1';
                } else {
                    nosIcon.style.opacity = '0.3';
                }
            }
        }
    }

    formatMoney(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'K';
        } else {
            return amount.toString();
        }
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    toggleVisibility(visible) {
        const container = document.getElementById('hud-container');
        if (container) {
            container.style.display = visible ? 'block' : 'none';
        }
    }

    toggleEditMode(editMode) {
        this.editMode = editMode;
        const container = document.getElementById('hud-container');
        const menu = document.getElementById('edit-menu');
        
        if (editMode) {
            if (container) container.classList.add('edit-mode');
            if (menu) menu.classList.remove('hidden');
            
            const oxygenElement = document.getElementById('hud-oxygen');
            if (oxygenElement && this.config.oxygen && this.config.oxygen.enabled) {
                oxygenElement.style.display = 'block';
                oxygenElement.style.opacity = '0.5';
            }
            
            const speedometerElement = document.getElementById('hud-speedometer');
            if (speedometerElement && this.config.speedometer && this.config.speedometer.enabled) {
                speedometerElement.style.display = 'block';
                speedometerElement.style.opacity = '0.5';
            }
            
            const talkingElement = document.getElementById('hud-talking');
            if (talkingElement && this.config.talking && this.config.talking.enabled) {
                talkingElement.style.display = 'block';
                talkingElement.style.opacity = '0.7';
            }
        } else {
            if (container) container.classList.remove('edit-mode');
            if (menu) menu.classList.add('hidden');
            
            const oxygenElement = document.getElementById('hud-oxygen');
            if (oxygenElement) {
                oxygenElement.style.display = 'none';
                oxygenElement.style.opacity = '1';
            }
            
            const speedometerElement = document.getElementById('hud-speedometer');
            if (speedometerElement) {
                speedometerElement.style.display = 'none';
                speedometerElement.style.opacity = '1';
            }
            
            const talkingElement = document.getElementById('hud-talking');
            if (talkingElement && this.config.talking && this.config.talking.enabled) {
                talkingElement.style.display = 'block';
                talkingElement.style.opacity = '1';
            }
            
            // Clear selection
            document.querySelectorAll('.hud-element').forEach(el => {
                el.classList.remove('selected');
            });
            this.selectedElement = null;
        }
    }

    selectElement(key) {
        // Remove previous selection
        document.querySelectorAll('.hud-element').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selection to current element
        const element = document.getElementById(`hud-${key}`);
        if (element) {
            element.classList.add('selected');
        }
        
        this.selectedElement = key;
        this.updateElementSettings(key);
    }

    updateElementSettings(key) {
        const element = this.config[key];
        if (!element) return;
        
        const settingsContainer = document.getElementById('element-settings');
        if (!settingsContainer) return;
        
        settingsContainer.innerHTML = '';
        
        // Element title
        const title = document.createElement('h3');
        title.textContent = element.name;
        title.style.color = '#ffffff';
        title.style.marginBottom = '15px';
        settingsContainer.appendChild(title);
        
        // Icon selector (for customizable elements)
        if (element.customizable && window.Config && window.Config.AvailableIcons && window.Config.AvailableIcons[key]) {
            const iconGroup = document.createElement('div');
            iconGroup.className = 'setting-group';
            
            const iconLabel = document.createElement('label');
            iconLabel.textContent = 'Icon';
            iconLabel.style.color = '#cccccc';
            iconLabel.style.marginBottom = '8px';
            iconLabel.style.display = 'block';
            
            const iconGrid = document.createElement('div');
            iconGrid.className = 'icon-grid';
            iconGrid.style.display = 'grid';
            iconGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            iconGrid.style.gap = '8px';
            iconGrid.style.marginBottom = '12px';
            
            window.Config.AvailableIcons[key].forEach(iconClass => {
                const iconOption = document.createElement('div');
                iconOption.className = 'icon-option';
                iconOption.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                `;
                
                if (iconClass === element.icon) {
                    iconOption.style.borderColor = '#4ECDC4';
                    iconOption.style.background = 'rgba(78, 205, 196, 0.2)';
                }
                
                const icon = document.createElement('i');
                icon.className = iconClass;
                icon.style.color = element.color || element.defaultColor;
                icon.style.fontSize = '18px';
                
                iconOption.appendChild(icon);
                
                iconOption.addEventListener('click', () => {
                    iconGrid.querySelectorAll('.icon-option').forEach(opt => {
                        opt.style.borderColor = 'transparent';
                        opt.style.background = 'rgba(255, 255, 255, 0.1)';
                    });
                    
                    iconOption.style.borderColor = '#4ECDC4';
                    iconOption.style.background = 'rgba(78, 205, 196, 0.2)';
                    
                    this.changeElementIcon(key, iconClass);
                });
                
                iconOption.addEventListener('mouseenter', () => {
                    if (iconClass !== element.icon) {
                        iconOption.style.background = 'rgba(255, 255, 255, 0.2)';
                    }
                });
                
                iconOption.addEventListener('mouseleave', () => {
                    if (iconClass !== element.icon) {
                        iconOption.style.background = 'rgba(255, 255, 255, 0.1)';
                    }
                });
                
                iconGrid.appendChild(iconOption);
            });
            
            iconGroup.appendChild(iconLabel);
            iconGroup.appendChild(iconGrid);
            settingsContainer.appendChild(iconGroup);
            
            // Radio icon selector for talking element
            if (key === 'talking' && window.Config.AvailableRadioIcons) {
                const radioIconGroup = document.createElement('div');
                radioIconGroup.className = 'setting-group';
                
                const radioIconLabel = document.createElement('label');
                radioIconLabel.textContent = 'Radio Icon';
                radioIconLabel.style.color = '#cccccc';
                radioIconLabel.style.marginBottom = '8px';
                radioIconLabel.style.display = 'block';
                
                const radioIconGrid = document.createElement('div');
                radioIconGrid.className = 'icon-grid';
                radioIconGrid.style.display = 'grid';
                radioIconGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                radioIconGrid.style.gap = '8px';
                radioIconGrid.style.marginBottom = '12px';
                
                window.Config.AvailableRadioIcons.forEach(iconClass => {
                    const iconOption = document.createElement('div');
                    iconOption.className = 'icon-option';
                    iconOption.style.cssText = `
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 40px;
                        height: 40px;
                        background: rgba(255, 255, 255, 0.1);
                        border: 2px solid transparent;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    `;
                    
                    if (iconClass === element.radioIcon) {
                        iconOption.style.borderColor = '#FF6B35';
                        iconOption.style.background = 'rgba(255, 107, 53, 0.2)';
                    }
                    
                    const icon = document.createElement('i');
                    icon.className = iconClass;
                    icon.style.color = element.defaultRadioColor || '#FF6B35';
                    icon.style.fontSize = '18px';
                    
                    iconOption.appendChild(icon);
                    
                    iconOption.addEventListener('click', () => {
                        radioIconGrid.querySelectorAll('.icon-option').forEach(opt => {
                            opt.style.borderColor = 'transparent';
                            opt.style.background = 'rgba(255, 255, 255, 0.1)';
                        });
                        
                        iconOption.style.borderColor = '#FF6B35';
                        iconOption.style.background = 'rgba(255, 107, 53, 0.2)';
                        
                        this.changeElementIcon(key, iconClass, 'radio');
                    });
                    
                    iconOption.addEventListener('mouseenter', () => {
                        if (iconClass !== element.radioIcon) {
                            iconOption.style.background = 'rgba(255, 255, 255, 0.2)';
                        }
                    });
                    
                    iconOption.addEventListener('mouseleave', () => {
                        if (iconClass !== element.radioIcon) {
                            iconOption.style.background = 'rgba(255, 255, 255, 0.1)';
                        }
                    });
                    
                    radioIconGrid.appendChild(iconOption);
                });
                
                radioIconGroup.appendChild(radioIconLabel);
                radioIconGroup.appendChild(radioIconGrid);
                settingsContainer.appendChild(radioIconGroup);
            }
        }
        
        // Color setting
        const colorGroup = document.createElement('div');
        colorGroup.className = 'setting-group';
        
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Color';
        colorLabel.style.color = '#cccccc';
        
        const colorPreview = document.createElement('div');
        colorPreview.className = 'color-preview';
        colorPreview.style.backgroundColor = element.color || element.defaultColor;
        colorPreview.addEventListener('click', () => {
            this.openColorPicker(key, 'main');
        });
        
        colorGroup.appendChild(colorLabel);
        colorGroup.appendChild(colorPreview);
        settingsContainer.appendChild(colorGroup);
        
        // Shape setting (for applicable elements)
        if (element.availableShapes && element.availableShapes.length > 0) {
            const shapeGroup = document.createElement('div');
            shapeGroup.className = 'setting-group';
            
            const shapeLabel = document.createElement('label');
            shapeLabel.textContent = 'Shape';
            shapeLabel.style.color = '#cccccc';
            shapeLabel.style.marginBottom = '8px';
            shapeLabel.style.display = 'block';
            
            const shapeSelect = document.createElement('select');
            shapeSelect.className = 'shape-select';
            shapeSelect.style.width = '100%';
            shapeSelect.style.padding = '8px';
            shapeSelect.style.borderRadius = '6px';
            shapeSelect.style.backgroundColor = '#3a3a3a';
            shapeSelect.style.color = '#ffffff';
            shapeSelect.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            
            element.availableShapes.forEach(shape => {
                const option = document.createElement('option');
                option.value = shape;
                option.textContent = shape.charAt(0).toUpperCase() + shape.slice(1).replace('-', ' ');
                if (shape === (element.shape || 'square')) {
                    option.selected = true;
                }
                shapeSelect.appendChild(option);
            });
            
            shapeSelect.addEventListener('change', (e) => {
                this.changeElementShape(key, e.target.value);
            });
            
            shapeGroup.appendChild(shapeLabel);
            shapeGroup.appendChild(shapeSelect);
            settingsContainer.appendChild(shapeGroup);
        }
        
        // Scale setting
        const scaleGroup = document.createElement('div');
        scaleGroup.className = 'setting-group';
        
        const scaleLabel = document.createElement('label');
        scaleLabel.textContent = `Scale: ${(element.scale || 1.0).toFixed(1)}x`;
        scaleLabel.style.color = '#cccccc';
        scaleLabel.style.marginBottom = '8px';
        scaleLabel.style.display = 'block';
        
        const scaleSlider = document.createElement('input');
        scaleSlider.type = 'range';
        scaleSlider.min = element.minScale || 0.5;
        scaleSlider.max = element.maxScale || 2.0;
        scaleSlider.step = 0.1;
        scaleSlider.value = element.scale || 1.0;
        scaleSlider.className = 'scale-slider';
        scaleSlider.style.width = '100%';
        scaleSlider.style.marginTop = '5px';
        
        scaleSlider.addEventListener('input', (e) => {
            const newScale = parseFloat(e.target.value);
            scaleLabel.textContent = `Scale: ${newScale.toFixed(1)}x`;
            this.changeElementScale(key, newScale);
        });
        
        scaleGroup.appendChild(scaleLabel);
        scaleGroup.appendChild(scaleSlider);
        settingsContainer.appendChild(scaleGroup);
    }

    openColorPicker(elementKey, colorType) {
        this.currentColorTarget = elementKey;
        this.currentColorType = colorType;
        
        const modal = document.getElementById('color-picker-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        
        const element = this.config[elementKey];
        const currentColor = element.color || element.defaultColor;
        const colorInput = document.getElementById('color-hex');
        if (colorInput) {
            colorInput.value = currentColor;
        }
    }

    closeColorPicker() {
        const modal = document.getElementById('color-picker-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.currentColorTarget = null;
        this.currentColorType = 'main';
    }

    applySelectedColor() {
        const colorInput = document.getElementById('color-hex');
        if (colorInput && this.currentColorTarget) {
            const color = colorInput.value;
            this.applyColor(this.currentColorTarget, color, this.currentColorType);
        }
        this.closeColorPicker();
    }

    applyColor(elementKey, color, colorType) {
        const element = this.config[elementKey];
        if (!element) return;
        
        if (colorType === 'main') {
            element.color = color;
        }
        
        const hudElement = document.getElementById(`hud-${elementKey}`);
        if (hudElement) {
            const icon = hudElement.querySelector('.element-icon');
            const progressFill = hudElement.querySelector('.progress-box-fill');
            
            if (icon) {
                icon.style.color = color;
            }
            if (progressFill) {
                progressFill.style.backgroundColor = color;
                
                const shape = element.shape || 'square';
                if (!progressFill.classList.contains(`shape-${shape}`)) {
                    progressFill.className = `progress-box-fill shape-${shape}`;
                    progressFill.style.backgroundColor = color;
                }
            }
        }
        
        this.createElementToggles();
        
        if (this.selectedElement === elementKey) {
            this.updateElementSettings(elementKey);
        }
    }

    closeEditMode() {
        // Send message to Lua to close edit mode
        fetch(`https://${GetParentResourceName()}/closeEditMode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }).catch(err => {});
        
        // Also toggle edit mode locally
        this.toggleEditMode(false);
    }

    saveConfig() {
        fetch(`https://${GetParentResourceName()}/saveConfig`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                config: this.config,
                settings: this.settings
            })
        }).then(() => {
            this.showNotification('Configuration saved successfully!', 'success');
        }).catch(err => {
            this.showNotification('Error saving configuration!', 'error');
        });
    }

    resetConfig(defaultConfig, defaultSettings) {
        this.config = { ...defaultConfig };
        this.settings = { ...defaultSettings };
        this.createHUDElements();
        this.createElementToggles();
        this.createSettingsToggles();
        this.showNotification('HUD reset to default configuration!', 'info');
    }

    resetToDefaults() {
        fetch(`https://${GetParentResourceName()}/getConfig`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        }).catch(err => {});
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 6px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            transition: all 0.3s ease;
            transform: translateX(100%);
        `;
        
        if (type === 'success') {
            notification.style.backgroundColor = '#2ECC71';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#E74C3C';
        } else {
            notification.style.backgroundColor = '#3498DB';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    toggleMapOverlay(visible) {
        const mapOverlay = document.getElementById('map-overlay');
        if (mapOverlay) {
            mapOverlay.style.display = visible ? 'block' : 'none';
        }
    }

    togglePauseOverlay(visible) {
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.style.display = visible ? 'block' : 'none';
        }
    }

    updateTalkingState(talking, radioTalking) {
        const talkingElement = document.getElementById('hud-talking');
        if (!talkingElement || !this.config.talking || !this.config.talking.enabled) return;
        
        const progressFill = talkingElement.querySelector('.progress-box-fill');
        const voiceIcon = talkingElement.querySelector('.progress-box-icon:not(.radio-icon)');
        const radioIcon = talkingElement.querySelector('.radio-icon');
        
        if (radioTalking) {
            talkingElement.classList.add('radio-talking');
            talkingElement.classList.remove('voice-talking');
            if (progressFill) {
                progressFill.classList.add('radio-active');
                progressFill.style.height = '100%';
                progressFill.style.opacity = '1';
            }
            if (voiceIcon) voiceIcon.style.display = 'none';
            if (radioIcon) radioIcon.style.display = 'block';
        } else if (talking) {
            talkingElement.classList.add('voice-talking');
            talkingElement.classList.remove('radio-talking');
            if (progressFill) {
                progressFill.classList.remove('radio-active');
                progressFill.style.height = '100%';
                progressFill.style.opacity = '1';
            }
            if (voiceIcon) voiceIcon.style.display = 'block';
            if (radioIcon) radioIcon.style.display = 'none';
        } else {
            talkingElement.classList.remove('voice-talking', 'radio-talking');
            if (progressFill) {
                progressFill.classList.remove('radio-active');
                progressFill.style.height = '0%';
                progressFill.style.opacity = '0';
            }
            if (voiceIcon) voiceIcon.style.display = 'block';
            if (radioIcon) radioIcon.style.display = 'none';
        }
    }

    changeElementShape(elementKey, newShape) {
        const element = this.config[elementKey];
        if (!element || !element.availableShapes || !element.availableShapes.includes(newShape)) {
            return;
        }
        
        element.shape = newShape;
        
        const hudElement = document.getElementById(`hud-${elementKey}`);
        if (hudElement) {
            hudElement.remove();
        }
        
        this.createElement(elementKey, element);
        
        this.updateElementSettings(elementKey);
        
        this.createElementToggles();
    }

    changeElementScale(elementKey, newScale) {
        const element = this.config[elementKey];
        if (!element) return;
        
        const minScale = element.minScale || 0.5;
        const maxScale = element.maxScale || 2.0;
        newScale = Math.max(minScale, Math.min(maxScale, newScale));
        
        element.scale = newScale;
        
        const hudElement = document.getElementById(`hud-${elementKey}`);
        if (hudElement) {
            hudElement.remove();
        }
        
        this.createElement(elementKey, element);
        
        this.updateElementSettings(elementKey);
    }

    changeElementIcon(elementKey, newIcon, iconType = 'main') {
        const element = this.config[elementKey];
        if (!element || !element.customizable) return;
        
        if (iconType === 'radio' && elementKey === 'talking') {
            element.radioIcon = newIcon;
        } else {
            element.icon = newIcon;
        }
        
        const hudElement = document.getElementById(`hud-${elementKey}`);
        if (hudElement) {
            hudElement.remove();
        }
        
        this.createElement(elementKey, element);
        
        this.updateElementSettings(elementKey);
        
        this.createElementToggles();
    }

    // Add method to validate icon exists before creating it
    validateIcon(iconClass) {
        // Create a temporary element to test if the icon exists
        const testElement = document.createElement('i');
        testElement.className = iconClass;
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        testElement.style.fontSize = '1px';
        
        document.body.appendChild(testElement);
        
        // Check if the icon loaded (basic check)
        const computed = window.getComputedStyle(testElement, '::before');
        const hasContent = computed.getPropertyValue('content') !== 'none' && computed.getPropertyValue('content') !== '';
        
        document.body.removeChild(testElement);
        
        return hasContent;
    }
}

function GetParentResourceName() {
    return 'muffin_hud';
}

const hudInstance = new MuffinHUD();



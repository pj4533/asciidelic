/**
 * UI Manager - Handles UI components and interactions
 */
import { colorModes } from '../config/defaults.js';

export class UIManager {
    /**
     * Create UI Manager
     * @param {HTMLElement} container - Container element
     * @param {Function} toggleModeCallback - Callback for toggling mode
     * @param {Function} updateAnimationInfoCallback - Callback for updating animation info
     */
    constructor(container, toggleModeCallback, updateAnimationInfoCallback) {
        this.container = container;
        this.toggleMode = toggleModeCallback;
        this.updateAnimationInfo = updateAnimationInfoCallback;
        
        // Store references to the DOM elements
        this.elements = {
            animationName: document.getElementById('animation-name'),
            modeDisplay: document.getElementById('mode-display'),
            keyCommands: document.getElementById('key-commands'),
            parameterDisplay: document.getElementById('parameter-display')
        };
        
        // Store the commands by mode
        this.commandsByMode = {
            common: [
                { key: '↑/↓', action: 'Change animation', className: 'common-command' },
                { key: 'R', action: 'Randomize', className: 'common-command' },
                { key: 'M', action: 'Toggle mode', className: 'common-command' }
            ],
            manual: [
                { key: '←/→', action: 'Change hue', className: 'manual-command' },
                { key: 'Space', action: 'Color mode', className: 'manual-command' },
                { key: '+/-', action: 'Speed', className: 'manual-command' },
                { key: 'S/D', action: 'Density', className: 'manual-command' }
            ]
        };
    }
    
    /**
     * Update the UI to reflect the current mode
     * @param {boolean} isAutomated - Whether we're in automated mode
     */
    updateModeDisplay(isAutomated) {
        // Update the mode text and class
        if (this.elements.modeDisplay) {
            this.elements.modeDisplay.textContent = isAutomated ? 'Automated Mode' : 'Manual Mode';
            this.elements.modeDisplay.className = isAutomated ? 'automated-mode' : 'manual-mode';
        }
        
        // Update key commands
        this.updateKeyCommands(isAutomated);
        
        // Clear and update parameter display
        this.clearParameterDisplay();
        
        // Show parameter display if in manual mode
        if (!isAutomated && this.elements.parameterDisplay) {
            this.updateParameterDisplay(this.getConfig());
        }
    }
    
    /**
     * Get current config from parent component
     * @returns {Object} Current configuration
     */
    getConfig() {
        if (this.updateAnimationInfo && typeof this.updateAnimationInfo === 'function') {
            return this.updateAnimationInfo();
        }
        return {};
    }
    
    /**
     * Update the list of key commands based on the current mode
     * @param {boolean} isAutomated - Whether we're in automated mode
     */
    updateKeyCommands(isAutomated) {
        const keyCommandsEl = this.elements.keyCommands;
        if (!keyCommandsEl) return;
        
        // Clear existing commands
        keyCommandsEl.innerHTML = '';
        
        // Add common commands
        this.commandsByMode.common.forEach(cmd => {
            keyCommandsEl.appendChild(this.createCommandElement(cmd));
        });
        
        // Add manual mode commands if in manual mode
        if (!isAutomated) {
            this.commandsByMode.manual.forEach(cmd => {
                keyCommandsEl.appendChild(this.createCommandElement(cmd));
            });
        }
    }
    
    /**
     * Create a command element
     * @param {Object} command - Command data
     * @returns {HTMLElement} Command element
     */
    createCommandElement(command) {
        const element = document.createElement('div');
        element.className = `key-command ${command.className}`;
        element.innerHTML = `<span class="key">${command.key}</span>: ${command.action}`;
        return element;
    }
    
    /**
     * Update animation info display
     * @param {number} index - Animation index
     * @param {Array} animations - Available animations
     * @param {Object} config - Current configuration
     */
    updateAnimationDisplay(index, animations, config) {
        // Update animation name
        if (this.elements.animationName && animations[index]) {
            this.elements.animationName.textContent = animations[index].name;
        }
        
        // Update parameter display for manual mode
        if (!config.isAutomatedMode) {
            this.updateParameterDisplay(config);
        }
    }
    
    /**
     * Clear the parameter display
     */
    clearParameterDisplay() {
        if (this.elements.parameterDisplay) {
            this.elements.parameterDisplay.innerHTML = '';
            this.elements.parameterDisplay.style.display = 'none';
        }
    }
    
    /**
     * Update the parameter display for manual mode
     * @param {Object} config - Current configuration
     */
    updateParameterDisplay(config) {
        const paramEl = this.elements.parameterDisplay;
        if (!paramEl) return;
        
        // Clear existing parameters
        paramEl.innerHTML = '';
        paramEl.style.display = 'flex';
        
        // Add parameters
        const parameters = [
            { name: 'Speed', value: config.speed.toFixed(1) },
            { name: 'Density', value: config.density.toFixed(1) },
            { name: 'Hue', value: Math.round(config.targetHue) + '°' },
            { name: 'Color Mode', value: this.getColorModeName(config.colorMode) }
        ];
        
        parameters.forEach(param => {
            const paramElement = document.createElement('div');
            paramElement.className = 'parameter';
            
            const nameElement = document.createElement('div');
            nameElement.className = 'parameter-name';
            nameElement.textContent = param.name;
            
            const valueElement = document.createElement('div');
            valueElement.className = 'parameter-value';
            valueElement.textContent = param.value;
            
            paramElement.appendChild(nameElement);
            paramElement.appendChild(valueElement);
            paramEl.appendChild(paramElement);
        });
    }
    
    /**
     * Update UI when a parameter changes
     * @param {Object} config - Current configuration
     * @param {string} paramName - Name of the parameter that changed
     * @param {*} value - New value of the parameter
     */
    updateParameterChange(config, paramName, value) {
        // Only update parameter display in manual mode
        if (!config.isAutomatedMode) {
            this.updateParameterDisplay(config);
        }
    }
    
    /**
     * Get the name of the current color mode
     * @param {number} modeIndex - Color mode index
     * @returns {string} Color mode name
     */
    getColorModeName(modeIndex) {
        if (colorModes && colorModes[modeIndex]) {
            return colorModes[modeIndex].name;
        }
        return 'Unknown';
    }
}
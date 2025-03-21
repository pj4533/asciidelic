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
        
        // UI elements
        this.infoElement = null;
        this.animationNameElement = null;
        this.controlsHint = null;
        this.modeIndicator = null;
        
        // Initialize UI
        this.createUI();
    }
    
    /**
     * Create UI elements
     */
    createUI() {
        // Create info container
        this.infoElement = document.createElement('div');
        this.infoElement.className = 'info';
        
        // Create animation name element
        this.animationNameElement = document.createElement('div');
        this.animationNameElement.id = 'animation-name';
        
        // Create controls hint
        this.controlsHint = document.createElement('div');
        this.controlsHint.id = 'controls-hint';
        this.controlsHint.textContent = '↑/↓: Change pattern | ←/→: Shift colors | Space: Color mode | +/-: Speed | S/D: Density';
        
        // Create mode indicator
        this.modeIndicator = document.createElement('div');
        this.modeIndicator.id = 'mode-indicator';
        this.modeIndicator.className = 'mode automated';
        this.modeIndicator.textContent = 'Automated Mode';
        
        // Append elements
        this.infoElement.appendChild(this.animationNameElement);
        this.infoElement.appendChild(this.modeIndicator);
        this.infoElement.appendChild(this.controlsHint);
        
        // Append to container parent
        this.container.parentElement.appendChild(this.infoElement);
        
        // Add CSS for the mode indicator
        this.addModeStyles();
    }
    
    /**
     * Add CSS styles for mode indicator
     */
    addModeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #mode-indicator {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .mode.manual {
                color: #0f0;
            }
            .mode.automated {
                color: #f90;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Update the UI to reflect the current mode
     * @param {boolean} isAutomated - Whether we're in automated mode
     */
    updateModeDisplay(isAutomated) {
        // Update the mode indicator text and class
        this.modeIndicator.textContent = isAutomated ? 'Automated Mode' : 'Manual Mode';
        this.modeIndicator.className = isAutomated ? 'mode automated' : 'mode manual';
        
        // In automated mode, we only show animation type controls
        if (isAutomated) {
            this.controlsHint.textContent = '↑/↓: Change pattern | M: Manual';
        } else {
            this.controlsHint.textContent = '↑/↓: Pattern | ←/→: Colors | Space: Color Mode | +/-: Speed | S/D: Density | M: Auto';
        }
    }
    
    /**
     * Update animation info display
     * @param {number} index - Animation index
     * @param {Array} animations - Available animations
     * @param {Object} config - Current configuration
     */
    updateAnimationDisplay(index, animations, config) {
        if (this.animationNameElement) {
            // Clear any existing elements
            while (this.animationNameElement.firstChild) {
                this.animationNameElement.removeChild(this.animationNameElement.firstChild);
            }
            
            // Create animation name element with main style
            const animName = document.createElement('div');
            animName.className = 'anim-name';
            animName.textContent = `Animation: ${animations[index].name}`;
            this.animationNameElement.appendChild(animName);
            
            // In manual mode, also show the parameter values in smaller text
            if (!config.isAutomatedMode) {
                this.addParameterDisplay(config);
            }
        }
    }
    
    /**
     * Add parameter display for manual mode
     * @param {Object} config - Current configuration
     */
    addParameterDisplay(config) {
        const colorModeName = this.getColorModeName(config.colorMode);
        
        const paramText = document.createElement('div');
        paramText.className = 'param-text';
        paramText.textContent = `Color: ${colorModeName} (${Math.round(config.targetHue)}°) | ` +
                                `Speed: ${config.speed.toFixed(1)} | ` +
                                `Density: ${config.density.toFixed(1)}`;
        
        this.animationNameElement.appendChild(paramText);
        
        // Add style for parameter text if not already added
        this.addParameterStyles();
    }
    
    /**
     * Add CSS styles for parameter display
     */
    addParameterStyles() {
        if (!document.getElementById('param-text-style')) {
            const style = document.createElement('style');
            style.id = 'param-text-style';
            style.textContent = `
                .anim-name {
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                .param-text {
                    font-size: 0.85em;
                    color: #aaa;
                    margin-top: 2px;
                }
            `;
            document.head.appendChild(style);
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
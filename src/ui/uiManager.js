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
        this.messageElement = null;
        
        // Controls for different modes - defined once to ensure consistency
        this.automatedModeControls = '↑/↓: Change pattern | R: Randomize | M: Manual mode';
        this.manualModeControls = '↑/↓: Pattern | ←/→: Colors | Space: Color mode | +/-: Speed | S/D: Density | R: Randomize | M: Auto mode';
        
        // Initialize UI
        this.createUI();
    }
    
    /**
     * Create UI elements
     */
    createUI() {
        // Create temporary message element (for notifications)
        this.messageElement = document.createElement('div');
        this.messageElement.id = 'temp-message';
        this.messageElement.style.display = 'none'; // Hidden by default
        
        // Get existing elements from the HTML (fail-proof approach)
        this.modeDisplay = document.getElementById('mode-display');
        
        // Find the existing controls container
        const controlsContainer = document.getElementById('controls-container');
        
        // Add the message element to the controls container
        if (controlsContainer) {
            controlsContainer.appendChild(this.messageElement);
        }
        
        // Remove old info element if it exists (to avoid duplicate controls)
        const oldInfo = document.querySelector('.info');
        if (oldInfo && oldInfo.parentNode) {
            oldInfo.parentNode.removeChild(oldInfo);
        }
        
        // Add CSS for messages
        this.addStyles();
    }
    
    /**
     * Add CSS styles for message element
     */
    addStyles() {
        // Only add styles that aren't already in the main CSS file
        const style = document.createElement('style');
        style.textContent = `
            #temp-message {
                font-weight: bold;
                color: #ff3366;
                margin: 10px 0;
                opacity: 1;
                transition: opacity 0.5s ease-out;
                text-align: center;
            }
            #temp-message.fade-out {
                opacity: 0;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Show a temporary message that disappears after a specified time
     * @param {string} message - Message to display
     * @param {number} duration - Time in milliseconds before the message disappears
     */
    showTemporaryMessage(message, duration = 2000) {
        if (!this.messageElement) return;
        
        // Clear any previous timeout
        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
            this.messageElement.classList.remove('fade-out');
        }
        
        // Show the message
        this.messageElement.textContent = message;
        this.messageElement.style.display = 'block';
        
        // Set timeout to hide the message
        this.messageTimeout = setTimeout(() => {
            // Fade out then hide
            this.messageElement.classList.add('fade-out');
            
            // After fade animation, hide completely
            setTimeout(() => {
                this.messageElement.style.display = 'none';
                this.messageElement.classList.remove('fade-out');
            }, 500);
        }, duration);
    }
    
    /**
     * Update the UI to reflect the current mode
     * @param {boolean} isAutomated - Whether we're in automated mode
     */
    updateModeDisplay(isAutomated) {
        // Update the mode display if it exists
        if (this.modeDisplay) {
            this.modeDisplay.textContent = isAutomated ? 'Automated Mode' : 'Manual Mode';
            this.modeDisplay.style.color = isAutomated ? '#f90' : '#0f0';
        }
        
        // Instead of updating controls hint, show a temporary message about mode change
        const message = isAutomated ? 'Switched to Automated Mode' : 'Switched to Manual Mode';
        this.showTemporaryMessage(message, 1500);
        
        // Update commands display with key commands relevant to the current mode
        this.updateKeyCommands(isAutomated);
    }
    
    /**
     * Updates the key commands displayed based on mode
     * @param {boolean} isAutomated - Whether we're in automated mode
     */
    updateKeyCommands(isAutomated) {
        const keyCommandsDiv = document.getElementById('key-commands');
        if (!keyCommandsDiv) return;
        
        // Clear existing commands
        keyCommandsDiv.innerHTML = '';
        
        // Common commands for both modes
        const commonCommands = [
            '↑/↓: Change animation',
            'R: Randomize',
            'M: Toggle mode'
        ];
        
        // Add common commands
        commonCommands.forEach(cmd => {
            const span = document.createElement('span');
            span.className = 'key-command';
            span.textContent = cmd;
            keyCommandsDiv.appendChild(span);
        });
        
        // Add mode-specific commands for manual mode
        if (!isAutomated) {
            const manualCommands = [
                '←/→: Colors',
                'Space: Color mode',
                '+/-: Speed',
                'S/D: Density'
            ];
            
            manualCommands.forEach(cmd => {
                const span = document.createElement('span');
                span.className = 'key-command manual-command';
                span.textContent = cmd;
                keyCommandsDiv.appendChild(span);
            });
        }
    }
    
    /**
     * Update animation info display
     * @param {number} index - Animation index
     * @param {Array} animations - Available animations
     * @param {Object} config - Current configuration
     */
    updateAnimationDisplay(index, animations, config) {
        // Find the animation name container in the new UI structure
        const animationInfo = document.getElementById('controls');
        if (!animationInfo || !animations[index]) return;
        
        // Update the title element or add a title if it doesn't exist
        let titleElement = document.querySelector('.current-animation');
        if (!titleElement) {
            titleElement = document.createElement('div');
            titleElement.className = 'current-animation';
            animationInfo.insertBefore(titleElement, animationInfo.firstChild);
        }
        
        // Set the animation name
        titleElement.textContent = `Animation: ${animations[index].name}`;
        
        // Show a temporary message when animation changes
        this.showTemporaryMessage(`Changed to ${animations[index].name}`, 1000);
    }
    
    /**
     * Add parameter display for manual mode - Not used in new UI
     */
    
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
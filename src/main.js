/**
 * Main entry point for AsciiDelic
 */
import { AsciiEngine } from './core/engine.js';
import { InputManager } from './core/input.js';
import { animations } from './animations/index.js';
import { defaultConfig, animations as animationsMeta } from './config/defaults.js';

export class AsciiDelic {
    /**
     * Initialize AsciiDelic
     */
    constructor() {
        // Container element for rendering
        this.container = null;
        
        // Core components
        this.engine = null;
        this.inputManager = null;
        
        // UI elements
        this.infoElement = null;
        this.animationNameElement = null;
    }

    /**
     * Initialize the application
     */
    init() {
        // Get container element
        this.container = document.getElementById('ascii-art');
        if (!this.container) {
            console.error('Container element not found');
            return;
        }
        
        // Create engine with default config
        this.engine = new AsciiEngine(this.container, defaultConfig);
        
        // Register all animations
        this.registerAnimations();
        
        // Create input manager
        this.inputManager = new InputManager();
        this.setupInputBindings();
        
        // Create UI elements
        this.createUI();
        
        // Set initial animation
        this.engine.setAnimation(animations[0].id);
        this.updateAnimationInfo(0);
        
        // Initialize mode based on config
        this.updateModeDisplay(this.engine.config.isAutomatedMode);
        
        // Start animation loop
        this.engine.start();
    }
    
    /**
     * Register all animations with the engine
     */
    registerAnimations() {
        animations.forEach(animation => {
            this.engine.registerAnimation(
                animation.id,
                animation.fn,
                { name: animation.name, description: animation.description }
            );
        });
    }

    /**
     * Set up input bindings
     */
    setupInputBindings() {
        // Animation navigation - always active regardless of mode
        this.inputManager.bindKey('ArrowUp', () => {
            const currentIdx = this.engine.config.animationType;
            const newIdx = (currentIdx + 1) % animations.length;
            this.engine.updateConfig({ animationType: newIdx });
            this.engine.setAnimation(animations[newIdx].id);
            this.updateAnimationInfo(newIdx);
        });
        
        this.inputManager.bindKey('ArrowDown', () => {
            const currentIdx = this.engine.config.animationType;
            const newIdx = (currentIdx - 1 + animations.length) % animations.length;
            this.engine.updateConfig({ animationType: newIdx });
            this.engine.setAnimation(animations[newIdx].id);
            this.updateAnimationInfo(newIdx);
        });
        
        // Mode toggle with keyboard
        this.inputManager.bindKey('m', () => {
            this.toggleMode();
        });
        
        this.inputManager.bindKey('M', () => {
            this.toggleMode();
        });
        
        // Color control - only in manual mode
        this.inputManager.bindKey('ArrowRight', () => {
            if (!this.engine.config.isAutomatedMode) {
                this.engine.updateConfig({ targetHue: (this.engine.config.targetHue + 30) % 360 });
            }
        });
        
        this.inputManager.bindKey('ArrowLeft', () => {
            if (!this.engine.config.isAutomatedMode) {
                this.engine.updateConfig({ targetHue: (this.engine.config.targetHue - 30 + 360) % 360 });
            }
        });
        
        // Color mode - only in manual mode
        this.inputManager.bindKey(' ', () => {
            if (!this.engine.config.isAutomatedMode) {
                const newMode = (this.engine.config.colorMode + 1) % 4;
                this.engine.updateConfig({ colorMode: newMode });
            }
        });
        
        // Speed control - only in manual mode
        this.inputManager.bindKey('+', () => {
            if (!this.engine.config.isAutomatedMode) {
                this.engine.updateConfig({ speed: Math.min(this.engine.config.speed + 0.1, 3.0) });
            }
        });
        
        this.inputManager.bindKey('=', () => {
            if (!this.engine.config.isAutomatedMode) {
                this.engine.updateConfig({ speed: Math.min(this.engine.config.speed + 0.1, 3.0) });
            }
        });
        
        this.inputManager.bindKey('-', () => {
            if (!this.engine.config.isAutomatedMode) {
                this.engine.updateConfig({ speed: Math.max(this.engine.config.speed - 0.1, 0.2) });
            }
        });
        
        this.inputManager.bindKey('_', () => {
            if (!this.engine.config.isAutomatedMode) {
                this.engine.updateConfig({ speed: Math.max(this.engine.config.speed - 0.1, 0.2) });
            }
        });
        
        // Density control - only in manual mode
        this.inputManager.bindKey('d', () => {
            if (!this.engine.config.isAutomatedMode) {
                this.engine.updateConfig({ density: Math.min(this.engine.config.density + 0.1, 1.0) });
            }
        });
        
        this.inputManager.bindKey('D', () => {
            if (!this.engine.config.isAutomatedMode) {
                this.engine.updateConfig({ density: Math.min(this.engine.config.density + 0.1, 1.0) });
            }
        });
        
        this.inputManager.bindKey('s', () => {
            if (!this.engine.config.isAutomatedMode) {
                this.engine.updateConfig({ density: Math.max(this.engine.config.density - 0.1, 0.1) });
            }
        });
        
        this.inputManager.bindKey('S', () => {
            if (!this.engine.config.isAutomatedMode) {
                this.engine.updateConfig({ density: Math.max(this.engine.config.density - 0.1, 0.1) });
            }
        });
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
     * Toggle between automated and manual modes
     */
    toggleMode() {
        const currentMode = this.engine.config.isAutomatedMode;
        const newMode = !currentMode;
        
        // Toggle the mode in the engine
        const configSnapshot = this.engine.toggleAutomatedMode(newMode);
        
        // Update the UI to reflect the new mode
        this.updateModeDisplay(newMode);
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
            this.controlsHint.textContent = '↑/↓: Pattern | ←/→: Colors | Space: Mode | +/-: Speed | S/D: Density | M: Auto';
        }
    }

    /**
     * Update animation info display
     * @param {number} index - Animation index
     */
    updateAnimationInfo(index) {
        if (this.animationNameElement) {
            this.animationNameElement.textContent = `Animation: ${animations[index].name}`;
        }
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const app = new AsciiDelic();
    app.init();
});
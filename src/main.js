/**
 * Main entry point for AsciiDelic
 */
import { AsciiEngine } from './core/engine.js';
import { animations } from './animations/index.js';
import { defaultConfig, DEFAULT_ANIMATION } from './config/defaults.js';
import { UIManager } from './ui/uiManager.js';
import { InputManager } from './ui/inputManager.js';

export class AsciiDelic {
    /**
     * Initialize AsciiDelic
     */
    constructor() {
        // Container element for rendering
        this.container = null;
        
        // Core components
        this.engine = null;
        this.uiManager = null;
        this.inputManager = null;
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
        
        // Create UI components
        this.uiManager = new UIManager(
            this.container, 
            this.toggleMode.bind(this), 
            this.updateAnimationInfo.bind(this)
        );
        
        // Create input manager
        this.inputManager = new InputManager(this.engine, this.uiManager, animations);
        
        // Find the default animation index
        const defaultAnimationIndex = animations.findIndex(anim => anim.id === DEFAULT_ANIMATION);
        const animIndex = defaultAnimationIndex >= 0 ? defaultAnimationIndex : 0;
        
        // Set initial animation
        this.engine.setAnimation(animations[animIndex].id);
        this.engine.updateConfig({ animationType: animIndex });
        this.updateAnimationInfo(animIndex);
        
        // Initialize mode based on config
        this.uiManager.updateModeDisplay(this.engine.config.isAutomatedMode);
        
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
     * Toggle between automated and manual modes
     */
    toggleMode() {
        const currentMode = this.engine.config.isAutomatedMode;
        const newMode = !currentMode;
        
        // Toggle the mode in the engine
        const configSnapshot = this.engine.toggleAutomatedMode(newMode);
        
        // Update the UI to reflect the new mode
        this.uiManager.updateModeDisplay(newMode);
        
        // Update animation info to show parameters if in manual mode
        const currentIdx = this.engine.config.animationType;
        this.updateAnimationInfo(currentIdx);
    }
    
    /**
     * Update animation info display
     * @param {number} index - Animation index
     */
    updateAnimationInfo(index) {
        this.uiManager.updateAnimationDisplay(index, animations, this.engine.config);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const app = new AsciiDelic();
    app.init();
});
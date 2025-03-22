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
        
        // Create UI manager
        const controlsContainer = document.getElementById('controls-container');
        this.uiManager = new UIManager(
            controlsContainer, 
            this.toggleMode.bind(this), 
            this.updateAnimationInfo.bind(this)
        );
        
        // Create input manager with animations
        this.inputManager = new InputManager(this.engine, this.uiManager, animations);
        
        // Initialize with default animation
        this.initializeDefaultAnimation();
        
        // Initialize UI based on current mode
        this.uiManager.updateModeDisplay(this.engine.config.isAutomatedMode);
        
        // Start animation loop
        this.engine.start();
    }
    
    /**
     * Initialize the default animation
     */
    initializeDefaultAnimation() {
        // Find the default animation in the animations array
        const defaultAnimIndex = animations.findIndex(anim => anim.id === DEFAULT_ANIMATION);
        
        if (defaultAnimIndex !== -1) {
            // First set the animation directly
            this.engine.setAnimation(DEFAULT_ANIMATION);
            
            // Then set animationType to match so UI and keyboard navigation work correctly
            this.engine.updateConfig({ animationType: defaultAnimIndex });
            
            // Update the UI to show the current animation
            this.updateAnimationInfo(defaultAnimIndex);
        } else {
            // Fallback to the first animation if default not found
            console.warn(`Default animation '${DEFAULT_ANIMATION}' not found, using first available.`);
            this.engine.setAnimation(animations[0].id);
            this.engine.updateConfig({ animationType: 0 });
            this.updateAnimationInfo(0);
        }
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
        this.engine.toggleAutomatedMode(newMode);
        
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
        // Validate index
        if (index >= 0 && index < animations.length) {
            this.uiManager.updateAnimationDisplay(index, animations, this.engine.config);
        }
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    const app = new AsciiDelic();
    app.init();
});
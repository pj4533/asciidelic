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
        // Animation navigation
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
        
        // Color control
        this.inputManager.bindKey('ArrowRight', () => {
            this.engine.updateConfig({ targetHue: (this.engine.config.targetHue + 30) % 360 });
        });
        
        this.inputManager.bindKey('ArrowLeft', () => {
            this.engine.updateConfig({ targetHue: (this.engine.config.targetHue - 30 + 360) % 360 });
        });
        
        // Color mode
        this.inputManager.bindKey(' ', () => {
            const newMode = (this.engine.config.colorMode + 1) % 4;
            this.engine.updateConfig({ colorMode: newMode });
        });
        
        // Speed control
        this.inputManager.bindKey('+', () => {
            this.engine.updateConfig({ speed: Math.min(this.engine.config.speed + 0.1, 3.0) });
        });
        
        this.inputManager.bindKey('=', () => {
            this.engine.updateConfig({ speed: Math.min(this.engine.config.speed + 0.1, 3.0) });
        });
        
        this.inputManager.bindKey('-', () => {
            this.engine.updateConfig({ speed: Math.max(this.engine.config.speed - 0.1, 0.2) });
        });
        
        this.inputManager.bindKey('_', () => {
            this.engine.updateConfig({ speed: Math.max(this.engine.config.speed - 0.1, 0.2) });
        });
        
        // Density control
        this.inputManager.bindKey('d', () => {
            this.engine.updateConfig({ density: Math.min(this.engine.config.density + 0.1, 1.0) });
        });
        
        this.inputManager.bindKey('D', () => {
            this.engine.updateConfig({ density: Math.min(this.engine.config.density + 0.1, 1.0) });
        });
        
        this.inputManager.bindKey('s', () => {
            this.engine.updateConfig({ density: Math.max(this.engine.config.density - 0.1, 0.1) });
        });
        
        this.inputManager.bindKey('S', () => {
            this.engine.updateConfig({ density: Math.max(this.engine.config.density - 0.1, 0.1) });
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
        const controlsHint = document.createElement('div');
        controlsHint.id = 'controls-hint';
        controlsHint.textContent = '↑/↓: Change pattern | ←/→: Shift colors | Space: Color mode | +/-: Speed | S/D: Density';
        
        // Append elements
        this.infoElement.appendChild(this.animationNameElement);
        this.infoElement.appendChild(controlsHint);
        
        // Append to container parent
        this.container.parentElement.appendChild(this.infoElement);
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
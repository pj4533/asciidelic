/**
 * Engine.js - Main animation engine for AsciiDelic
 */
import { CharacterGrid } from './grid.js';
import { Renderer } from './renderer.js';
import { defaultConfig, getAllCharacters } from '../config/defaults.js';
import { ColorManager } from '../utils/color.js';

export class AsciiEngine {
    /**
     * Create a new AsciiDelic animation engine
     * @param {HTMLElement} container - Container element for rendering
     * @param {Object} config - Configuration options
     */
    constructor(container, config = {}) {
        // Merge provided config with defaults
        this.config = { ...defaultConfig, ...config };
        
        // Setup core components
        this.grid = new CharacterGrid(this.config.width, this.config.height);
        this.renderer = new Renderer(container);
        this.colorManager = new ColorManager(this.config);
        
        // Animation state
        this.time = 0;
        this.lastTime = Date.now();
        this.isRunning = false;
        this.animationId = null;
        this.currentAnimation = null;
        
        // Available characters
        this.characters = getAllCharacters();
        
        // Registered animations
        this.animations = new Map();
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        const oldConfig = this.config;
        this.config = { ...this.config, ...newConfig };
        
        // Handle dimension changes
        if (this.config.width !== oldConfig.width || this.config.height !== oldConfig.height) {
            this.grid.resize(this.config.width, this.config.height);
        }
        
        // Update color manager with new config
        this.colorManager.updateConfig(this.config);
    }

    /**
     * Register an animation
     * @param {string} id - Animation identifier
     * @param {Function} animationFn - Animation function
     * @param {Object} metadata - Animation metadata
     */
    registerAnimation(id, animationFn, metadata = {}) {
        this.animations.set(id, {
            id,
            fn: animationFn,
            ...metadata
        });
    }

    /**
     * Set the current animation
     * @param {string} id - Animation identifier
     */
    setAnimation(id) {
        if (this.animations.has(id)) {
            this.currentAnimation = this.animations.get(id);
        } else {
            console.warn(`Animation '${id}' not found`);
        }
    }

    /**
     * Get a list of available animations
     * @returns {Array} List of animation data
     */
    getAnimations() {
        return Array.from(this.animations.values()).map(anim => ({
            id: anim.id,
            name: anim.name || anim.id,
            description: anim.description || ''
        }));
    }

    /**
     * Start the animation loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = Date.now();
        this.animationLoop();
    }

    /**
     * Stop the animation loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Main animation loop
     */
    animationLoop() {
        if (!this.isRunning) return;
        
        const now = Date.now();
        const delta = Math.min(now - this.lastTime, 100); // Cap at 100ms to prevent huge jumps
        this.lastTime = now;
        
        this.time += delta * 0.001; // Convert to seconds
        
        this.update(delta * 0.001);
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.animationLoop());
    }

    /**
     * Update the animation state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Update color transitions
        this.colorManager.update(deltaTime);
        
        // Handle automated parameter changes if enabled
        if (this.config.isAutomatedMode) {
            this.updateAutomatedParameters(deltaTime);
        }
        
        // Run the current animation
        if (this.currentAnimation && typeof this.currentAnimation.fn === 'function') {
            this.currentAnimation.fn(
                this.grid, 
                this.time, 
                deltaTime, 
                this.config, 
                this.characters,
                this.colorManager
            );
        }
    }
    
    /**
     * Update parameters automatically in automated mode
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateAutomatedParameters(deltaTime) {
        // Check if it's time for a parameter change
        if (this.time >= this.config.nextTransitionTime) {
            // Set the next transition time
            this.config.nextTransitionTime = this.time + this.config.transitionDuration;
            
            // Randomly change parameters
            // Speed changes
            const newSpeed = 0.5 + Math.random() * 2.0; // Between 0.5 and 2.5
            this.updateConfig({ speed: newSpeed });
            
            // Density changes
            const newDensity = 0.3 + Math.random() * 0.6; // Between 0.3 and 0.9
            this.updateConfig({ density: newDensity });
            
            // Color mode changes - occasionally change color mode
            if (Math.random() < 0.3) { // 30% chance to change color mode
                const newColorMode = Math.floor(Math.random() * 4); // 0-3
                this.updateConfig({ colorMode: newColorMode });
            }
            
            // Hue changes - always change the target hue for smooth transitions
            const newHue = Math.floor(Math.random() * 360);
            this.updateConfig({ targetHue: newHue });
            
            // Color transition speed changes
            const newTransitionSpeed = 0.02 + Math.random() * 0.08; // Between 0.02 and 0.1
            this.updateConfig({ hueTransitionSpeed: newTransitionSpeed });
            
            // Occasionally select different character sets
            if (Math.random() < 0.4) { // 40% chance to change characters
                // Get all character set names
                const charSetNames = Object.keys(this.characters);
                if (charSetNames.length > 0) {
                    // Select a random character set
                    const randomSetName = charSetNames[Math.floor(Math.random() * charSetNames.length)];
                    this.currentCharacterSet = randomSetName;
                }
            }
        }
    }
    
    /**
     * Toggle between automated and manual modes
     * @param {boolean} isAutomated - Whether to enable automated mode
     * @returns {Object} - Current configuration snapshot for reference
     */
    toggleAutomatedMode(isAutomated) {
        // Save current configuration as a snapshot if going from automated to manual
        const configSnapshot = { ...this.config };
        
        // Update the mode
        this.updateConfig({ 
            isAutomatedMode: isAutomated,
            // Reset transition timer when entering automated mode
            nextTransitionTime: isAutomated ? this.time : 0
        });
        
        return configSnapshot;
    }

    /**
     * Render the current state
     */
    render() {
        this.renderer.render(this.grid);
    }
}
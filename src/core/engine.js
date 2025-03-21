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
     * Render the current state
     */
    render() {
        this.renderer.render(this.grid);
    }
}
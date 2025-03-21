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
        // Check if it's time to set new target parameters
        if (this.time >= this.config.nextTransitionTime) {
            // Set the next transition time
            this.config.nextTransitionTime = this.time + this.config.transitionDuration;
            
            // Reset transition progress
            this.updateConfig({ transitionProgress: 0 });
            
            // Select which parameters to transition (only change some at a time)
            const changeSpeed = Math.random() < 0.6;  // 60% chance
            const changeDensity = Math.random() < 0.4; // 40% chance 
            const changeColorMode = Math.random() < 0.15; // 15% chance (rare)
            const changeHue = true; // Always change, but gradually

            // Set new target values - these will be gradually transitioned to
            if (changeSpeed) {
                // Target a speed that's not too far from current (gradual change)
                const currentSpeed = this.config.speed;
                const maxChange = 0.8; // Maximum change allowed
                const newTarget = currentSpeed + (Math.random() * maxChange * 2 - maxChange);
                // Keep within reasonable bounds
                const targetSpeed = Math.max(0.3, Math.min(2.5, newTarget));
                this.updateConfig({ targetSpeed });
            }
            
            if (changeDensity) {
                // Target a density that's not too far from current
                const currentDensity = this.config.density;
                const maxChange = 0.3; // Maximum change allowed
                const newTarget = currentDensity + (Math.random() * maxChange * 2 - maxChange);
                // Keep within reasonable bounds
                const targetDensity = Math.max(0.2, Math.min(0.9, newTarget));
                this.updateConfig({ targetDensity });
            }
            
            if (changeColorMode) {
                // Occasionally change the target color mode
                const currentMode = this.config.colorMode;
                // Pick a different mode than current
                let newMode;
                do {
                    newMode = Math.floor(Math.random() * 4); // 0-3
                } while (newMode === currentMode);
                this.updateConfig({ targetColorMode: newMode });
            }
            
            if (changeHue) {
                // Gradually shift hue - always change this for visual interest
                // Choose a target that's 60-180 degrees away for nice transitions
                const currentHue = this.config.targetHue;
                const hueShift = 60 + Math.random() * 120; // Between 60 and 180 degrees
                const direction = Math.random() < 0.5 ? 1 : -1; // Clockwise or counterclockwise
                let newHue = (currentHue + (hueShift * direction)) % 360;
                if (newHue < 0) newHue += 360;
                
                this.updateConfig({ targetHue: newHue });
                
                // Adjust transition speed slightly for color
                const newTransitionSpeed = 0.02 + Math.random() * 0.04; // Between 0.02 and 0.06 (more subtle)
                this.updateConfig({ hueTransitionSpeed: newTransitionSpeed });
            }
        }
        
        // Gradually transition between values using easing function
        this.updateTransitionProgress(deltaTime);
        this.applyParameterTransitions();
    }
    
    /**
     * Update transition progress for smooth parameter changes
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateTransitionProgress(deltaTime) {
        // Increment transition progress based on time
        const step = this.config.transitionStep * (deltaTime * 60); // Normalize for 60fps
        let progress = this.config.transitionProgress + step;
        
        // Cap at 1.0
        if (progress >= 1.0) {
            progress = 1.0;
        }
        
        // Update config
        this.updateConfig({ transitionProgress: progress });
    }
    
    /**
     * Apply smooth transitions between current and target parameter values
     */
    applyParameterTransitions() {
        // Early return if no transition progress
        if (this.config.transitionProgress <= 0) return;
        
        // Get ease value for smoother transitions (ease in-out)
        const t = this.config.transitionProgress;
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // Quadratic ease in-out
        
        // Smoothly transition between current and target values
        
        // Speed transition
        if (this.config.speed !== this.config.targetSpeed) {
            const newSpeed = this.config.speed + (this.config.targetSpeed - this.config.speed) * ease * 0.05;
            this.updateConfig({ speed: newSpeed });
        }
        
        // Density transition
        if (this.config.density !== this.config.targetDensity) {
            const newDensity = this.config.density + (this.config.targetDensity - this.config.density) * ease * 0.05;
            this.updateConfig({ density: newDensity });
        }
        
        // Color mode transition (discrete, so only apply at certain threshold)
        if (this.config.colorMode !== this.config.targetColorMode && ease > 0.9) {
            this.updateConfig({ colorMode: this.config.targetColorMode });
        }
        
        // No need to update hue here as the ColorManager already handles smooth transitions for hue
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
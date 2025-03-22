/**
 * Automation Manager - Handles automated parameter changes
 */

/**
 * AutomationManager manages the automatic parameter changes
 */
export class AutomationManager {
    /**
     * Create a new automation manager
     * @param {Object} config - Configuration settings
     * @param {Function} updateConfigCallback - Callback to update config
     */
    constructor(config, updateConfigCallback) {
        this.config = config;
        this.updateConfig = updateConfigCallback;
    }
    
    /**
     * Update configuration reference
     * @param {Object} config - Updated configuration
     */
    setConfig(config) {
        this.config = config;
    }
    
    /**
     * Update parameters automatically
     * @param {number} time - Current time in seconds
     * @param {number} deltaTime - Time since last update in seconds
     */
    updateParameters(time, deltaTime) {
        // Check if it's time to set new target parameters
        if (time >= this.config.nextTransitionTime) {
            this.setNewTargets(time);
        }
        
        // Gradually transition between values using easing function
        this.updateTransitionProgress(deltaTime);
        this.applyParameterTransitions();
    }
    
    /**
     * Set new target values for automated parameters
     * @param {number} time - Current time in seconds
     */
    setNewTargets(time) {
        // Set the next transition time
        this.config.nextTransitionTime = time + this.config.transitionDuration;
        
        // Reset transition progress
        this.updateConfig({ transitionProgress: 0 });
        
        // Select which parameters to transition (only change some at a time)
        const changeSpeed = Math.random() < 0.6;  // 60% chance
        const changeDensity = Math.random() < 0.4; // 40% chance 
        const changeColorMode = Math.random() < 0.15; // 15% chance (rare)
        const changeHue = true; // Always change, but gradually
        
        // Set new target values
        this.updateSpeedIfNeeded(changeSpeed);
        this.updateDensityIfNeeded(changeDensity);
        this.updateColorModeIfNeeded(changeColorMode);
        this.updateHueIfNeeded(changeHue);
    }
    
    /**
     * Update speed parameter if needed
     * @param {boolean} changeSpeed - Whether to change speed
     */
    updateSpeedIfNeeded(changeSpeed) {
        if (changeSpeed) {
            // Target a speed that's not too far from current (gradual change)
            const currentSpeed = this.config.speed;
            const maxChange = 0.8; // Maximum change allowed
            const newTarget = currentSpeed + (Math.random() * maxChange * 2 - maxChange);
            // Keep within reasonable bounds
            const targetSpeed = Math.max(0.3, Math.min(2.5, newTarget));
            this.updateConfig({ targetSpeed });
        }
    }
    
    /**
     * Update density parameter if needed
     * @param {boolean} changeDensity - Whether to change density
     */
    updateDensityIfNeeded(changeDensity) {
        if (changeDensity) {
            // Target a density that's not too far from current
            const currentDensity = this.config.density;
            const maxChange = 0.3; // Maximum change allowed
            const newTarget = currentDensity + (Math.random() * maxChange * 2 - maxChange);
            // Keep within reasonable bounds
            const targetDensity = Math.max(0.2, Math.min(0.9, newTarget));
            this.updateConfig({ targetDensity });
        }
    }
    
    /**
     * Randomize all parameters at once
     * Creates dramatic instant changes for visual impact
     * @returns {Object} The randomized parameters
     */
    randomizeAllParameters() {
        // Generate completely random values (not gradual changes)
        
        // Random speed (0.3 to 2.5)
        const randomSpeed = 0.3 + Math.random() * 2.2;
        
        // Random density (0.2 to 0.9)
        const randomDensity = 0.2 + Math.random() * 0.7;
        
        // Random color mode (0 to 3)
        const randomColorMode = Math.floor(Math.random() * 4);
        
        // Random hue (0 to 359)
        const randomHue = Math.floor(Math.random() * 360);
        
        // Faster transition for more immediate visual effect
        const randomTransitionSpeed = 0.1 + Math.random() * 0.1;
        
        // Update all parameters at once
        this.updateConfig({
            // Apply speed change immediately and as a target
            speed: randomSpeed,
            targetSpeed: randomSpeed,
            
            // Apply density change immediately and as a target
            density: randomDensity,
            targetDensity: randomDensity,
            
            // Apply color mode immediately
            colorMode: randomColorMode,
            targetColorMode: randomColorMode,
            
            // Apply hue change immediately and as a target
            baseHue: randomHue,
            targetHue: randomHue,
            
            // Set faster transition for more dramatic effect
            hueTransitionSpeed: randomTransitionSpeed,
            
            // Reset transition so changes start taking effect immediately
            transitionProgress: 0
        });
        
        return {
            speed: randomSpeed,
            density: randomDensity,
            colorMode: randomColorMode,
            hue: randomHue
        };
    }
    
    /**
     * Update color mode parameter if needed
     * @param {boolean} changeColorMode - Whether to change color mode
     */
    updateColorModeIfNeeded(changeColorMode) {
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
    }
    
    /**
     * Update hue parameter if needed
     * @param {boolean} changeHue - Whether to change hue
     */
    updateHueIfNeeded(changeHue) {
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
        this.transitionSpeed(ease);
        this.transitionDensity(ease);
        this.transitionColorMode(ease);
    }
    
    /**
     * Transition speed parameter
     * @param {number} ease - Easing value
     */
    transitionSpeed(ease) {
        if (this.config.speed !== this.config.targetSpeed) {
            const newSpeed = this.config.speed + (this.config.targetSpeed - this.config.speed) * ease * 0.05;
            this.updateConfig({ speed: newSpeed });
        }
    }
    
    /**
     * Transition density parameter
     * @param {number} ease - Easing value
     */
    transitionDensity(ease) {
        if (this.config.density !== this.config.targetDensity) {
            const newDensity = this.config.density + (this.config.targetDensity - this.config.density) * ease * 0.05;
            this.updateConfig({ density: newDensity });
        }
    }
    
    /**
     * Transition color mode parameter
     * @param {number} ease - Easing value
     */
    transitionColorMode(ease) {
        // Color mode transition (discrete, so only apply at certain threshold)
        if (this.config.colorMode !== this.config.targetColorMode && ease > 0.9) {
            this.updateConfig({ colorMode: this.config.targetColorMode });
        }
    }
}
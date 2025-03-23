/**
 * Input Handlers - Action handlers for user input
 */

/**
 * Create action handlers for input events
 * @param {Object} engine - AsciiEngine instance
 * @param {Object} uiManager - UIManager instance
 * @param {Array} animations - Available animations
 * @returns {Object} Object with action handler methods
 */
export function createInputHandlers(engine, uiManager, animations) {
    return {
        /**
         * Switch to the previous animation
         */
        handleAnimationPrevious() {
            const currentIdx = engine.config.animationType;
            const newIdx = (currentIdx - 1 + animations.length) % animations.length;
            this.changeAnimation(newIdx);
        },
        
        /**
         * Switch to the next animation
         */
        handleAnimationNext() {
            const currentIdx = engine.config.animationType;
            const newIdx = (currentIdx + 1) % animations.length;
            this.changeAnimation(newIdx);
        },
        
        /**
         * Change to a specific animation
         * @param {number} index - Index of the animation to switch to
         */
        changeAnimation(index) {
            if (index < 0 || index >= animations.length) return;
            
            engine.updateConfig({ animationType: index });
            engine.setAnimation(animations[index].id);
            uiManager.updateAnimationDisplay(index, animations, engine.config);
        },
        
        /**
         * Handle mode toggle
         */
        handleModeToggle() {
            const currentMode = engine.config.isAutomatedMode;
            const newMode = !currentMode;
            
            const configSnapshot = engine.toggleAutomatedMode(newMode);
            uiManager.updateModeDisplay(newMode);
            
            const currentIdx = engine.config.animationType;
            uiManager.updateAnimationDisplay(currentIdx, animations, engine.config);
        },
        
        /**
         * Handle color shift right
         */
        handleColorRight() {
            if (!engine.config.isAutomatedMode) {
                const newHue = (engine.config.targetHue + 30) % 360;
                engine.updateConfig({ targetHue: newHue });
                uiManager.updateParameterChange(engine.config, 'targetHue', newHue);
            }
        },
        
        /**
         * Handle color shift left
         */
        handleColorLeft() {
            if (!engine.config.isAutomatedMode) {
                const newHue = (engine.config.targetHue - 30 + 360) % 360;
                engine.updateConfig({ targetHue: newHue });
                uiManager.updateParameterChange(engine.config, 'targetHue', newHue);
            }
        },
        
        /**
         * Handle color mode change
         */
        handleColorMode() {
            if (!engine.config.isAutomatedMode) {
                const newMode = (engine.config.colorMode + 1) % 4;
                engine.updateConfig({ colorMode: newMode });
                uiManager.updateParameterChange(engine.config, 'colorMode', newMode);
            }
        },
        
        /**
         * Handle speed increase
         */
        handleSpeedIncrease() {
            if (!engine.config.isAutomatedMode) {
                const newSpeed = Math.min(engine.config.speed + 0.1, 3.0);
                engine.updateConfig({ speed: newSpeed });
                uiManager.updateParameterChange(engine.config, 'speed', newSpeed);
            }
        },
        
        /**
         * Handle speed decrease
         */
        handleSpeedDecrease() {
            if (!engine.config.isAutomatedMode) {
                const newSpeed = Math.max(engine.config.speed - 0.1, 0.2);
                engine.updateConfig({ speed: newSpeed });
                uiManager.updateParameterChange(engine.config, 'speed', newSpeed);
            }
        },
        
        /**
         * Handle density increase
         */
        handleDensityIncrease() {
            if (!engine.config.isAutomatedMode) {
                const newDensity = Math.min(engine.config.density + 0.1, 1.0);
                engine.updateConfig({ density: newDensity });
                uiManager.updateParameterChange(engine.config, 'density', newDensity);
            }
        },
        
        /**
         * Handle density decrease
         */
        handleDensityDecrease() {
            if (!engine.config.isAutomatedMode) {
                const newDensity = Math.max(engine.config.density - 0.1, 0.1);
                engine.updateConfig({ density: newDensity });
                uiManager.updateParameterChange(engine.config, 'density', newDensity);
            }
        },
        
        /**
         * Handle randomize request
         * Randomizes all parameters regardless of mode
         */
        handleRandomize() {
            if (engine.automationManager) {
                const newParams = engine.automationManager.randomizeAllParameters();
                
                // Update UI to show parameters
                const currentIdx = engine.config.animationType;
                uiManager.updateAnimationDisplay(currentIdx, animations, engine.config);
            }
        }
    };
}
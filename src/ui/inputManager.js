/**
 * Input Manager - Central system for handling user input in AsciiDelic
 */
export class InputManager {
    /**
     * Create a new input manager
     * @param {Object} engine - AsciiEngine instance
     * @param {Object} uiManager - UIManager instance
     * @param {Array} animations - Available animations
     */
    constructor(engine, uiManager, animations) {
        this.engine = engine;
        this.uiManager = uiManager;
        this.animations = animations;
        this.keyBindings = new Map();
        this.keysPressed = new Set();
        
        // Set up key bindings and event listeners
        if (engine && uiManager && animations) {
            this.setupDefaultBindings();
            this.setupEventListeners();
        }
    }
    
    /**
     * Set up keyboard and touch event listeners
     */
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Touch events for mobile support
        document.addEventListener('touchstart', this.handleTouchStart.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    /**
     * Handle key down events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        if (event.repeat) return; // Ignore key repeat
        
        this.keysPressed.add(event.key);
        
        // Execute the bound action if any
        if (this.keyBindings.has(event.key)) {
            const callback = this.keyBindings.get(event.key);
            callback();
        }
    }
    
    /**
     * Handle key up events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
        this.keysPressed.delete(event.key);
    }
    
    /**
     * Handle touch start events
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        const touch = event.touches[0];
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Simulate arrow key presses based on touch position
        if (touch.clientY < height * 0.3) {
            // Top third - up arrow
            this.simulateKeyPress('ArrowUp');
        } else if (touch.clientY > height * 0.7) {
            // Bottom third - down arrow
            this.simulateKeyPress('ArrowDown');
        } else if (touch.clientX < width * 0.3) {
            // Left third - left arrow
            this.simulateKeyPress('ArrowLeft');
        } else if (touch.clientX > width * 0.7) {
            // Right third - right arrow
            this.simulateKeyPress('ArrowRight');
        } else {
            // Center - space bar
            this.simulateKeyPress(' ');
        }
    }
    
    /**
     * Handle touch end events
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        // Clear simulated keys
        this.keysPressed.clear();
    }
    
    /**
     * Simulate a key press
     * @param {string} key - Key to simulate
     */
    simulateKeyPress(key) {
        if (this.keyBindings.has(key)) {
            const callback = this.keyBindings.get(key);
            callback();
        }
    }
    
    /**
     * Bind a key to a function
     * @param {string} key - Key to bind
     * @param {Function} callback - Function to call when key is pressed
     */
    bindKey(key, callback) {
        this.keyBindings.set(key, callback);
    }
    
    /**
     * Unregister a key binding
     * @param {string} key - Key to unbind
     */
    unbindKey(key) {
        this.keyBindings.delete(key);
    }
    
    /**
     * Check if a key is currently pressed
     * @param {string} key - Key to check
     * @returns {boolean} True if the key is pressed
     */
    isKeyPressed(key) {
        return this.keysPressed.has(key);
    }
    
    /**
     * Set up the default key bindings
     */
    setupDefaultBindings() {
        // Animation navigation - always active regardless of mode
        this.bindKey('ArrowUp', this.handleAnimationPrevious.bind(this));
        this.bindKey('ArrowDown', this.handleAnimationNext.bind(this));
        
        // Mode toggle
        this.bindKey('m', this.handleModeToggle.bind(this));
        this.bindKey('M', this.handleModeToggle.bind(this));
        
        // Randomize parameters in automated mode
        this.bindKey('r', this.handleRandomize.bind(this));
        this.bindKey('R', this.handleRandomize.bind(this));
        
        // Manual mode controls
        this.bindKey('ArrowRight', this.handleColorRight.bind(this));
        this.bindKey('ArrowLeft', this.handleColorLeft.bind(this));
        this.bindKey(' ', this.handleColorMode.bind(this));
        
        // Speed controls
        this.bindKey('+', this.handleSpeedIncrease.bind(this));
        this.bindKey('=', this.handleSpeedIncrease.bind(this));
        this.bindKey('-', this.handleSpeedDecrease.bind(this));
        this.bindKey('_', this.handleSpeedDecrease.bind(this));
        
        // Density controls
        this.bindKey('d', this.handleDensityIncrease.bind(this));
        this.bindKey('D', this.handleDensityIncrease.bind(this));
        this.bindKey('s', this.handleDensityDecrease.bind(this));
        this.bindKey('S', this.handleDensityDecrease.bind(this));
    }
    
    /**
     * Switch to the previous animation
     */
    handleAnimationPrevious() {
        const currentIdx = this.engine.config.animationType;
        const newIdx = (currentIdx - 1 + this.animations.length) % this.animations.length;
        this.changeAnimation(newIdx);
    }
    
    /**
     * Switch to the next animation
     */
    handleAnimationNext() {
        const currentIdx = this.engine.config.animationType;
        const newIdx = (currentIdx + 1) % this.animations.length;
        this.changeAnimation(newIdx);
    }
    
    /**
     * Change to a specific animation
     * @param {number} index - Index of the animation to switch to
     */
    changeAnimation(index) {
        this.engine.updateConfig({ animationType: index });
        this.engine.setAnimation(this.animations[index].id);
        this.uiManager.updateAnimationDisplay(index, this.animations, this.engine.config);
    }
    
    /**
     * Handle mode toggle
     */
    handleModeToggle() {
        const currentMode = this.engine.config.isAutomatedMode;
        const newMode = !currentMode;
        
        const configSnapshot = this.engine.toggleAutomatedMode(newMode);
        this.uiManager.updateModeDisplay(newMode);
        
        const currentIdx = this.engine.config.animationType;
        this.uiManager.updateAnimationDisplay(currentIdx, this.animations, this.engine.config);
    }
    
    /**
     * Handle color shift right
     */
    handleColorRight() {
        if (!this.engine.config.isAutomatedMode) {
            this.engine.updateConfig({ targetHue: (this.engine.config.targetHue + 30) % 360 });
            this.uiManager.updateAnimationDisplay(this.engine.config.animationType, this.animations, this.engine.config);
        }
    }
    
    /**
     * Handle color shift left
     */
    handleColorLeft() {
        if (!this.engine.config.isAutomatedMode) {
            this.engine.updateConfig({ targetHue: (this.engine.config.targetHue - 30 + 360) % 360 });
            this.uiManager.updateAnimationDisplay(this.engine.config.animationType, this.animations, this.engine.config);
        }
    }
    
    /**
     * Handle color mode change
     */
    handleColorMode() {
        if (!this.engine.config.isAutomatedMode) {
            const newMode = (this.engine.config.colorMode + 1) % 4;
            this.engine.updateConfig({ colorMode: newMode });
            this.uiManager.updateAnimationDisplay(this.engine.config.animationType, this.animations, this.engine.config);
        }
    }
    
    /**
     * Handle speed increase
     */
    handleSpeedIncrease() {
        if (!this.engine.config.isAutomatedMode) {
            this.engine.updateConfig({ speed: Math.min(this.engine.config.speed + 0.1, 3.0) });
            this.uiManager.updateAnimationDisplay(this.engine.config.animationType, this.animations, this.engine.config);
        }
    }
    
    /**
     * Handle speed decrease
     */
    handleSpeedDecrease() {
        if (!this.engine.config.isAutomatedMode) {
            this.engine.updateConfig({ speed: Math.max(this.engine.config.speed - 0.1, 0.2) });
            this.uiManager.updateAnimationDisplay(this.engine.config.animationType, this.animations, this.engine.config);
        }
    }
    
    /**
     * Handle density increase
     */
    handleDensityIncrease() {
        if (!this.engine.config.isAutomatedMode) {
            this.engine.updateConfig({ density: Math.min(this.engine.config.density + 0.1, 1.0) });
            this.uiManager.updateAnimationDisplay(this.engine.config.animationType, this.animations, this.engine.config);
        }
    }
    
    /**
     * Handle density decrease
     */
    handleDensityDecrease() {
        if (!this.engine.config.isAutomatedMode) {
            this.engine.updateConfig({ density: Math.max(this.engine.config.density - 0.1, 0.1) });
            this.uiManager.updateAnimationDisplay(this.engine.config.animationType, this.animations, this.engine.config);
        }
    }
    
    /**
     * Handle randomize request
     * Randomizes all parameters when in automated mode for dramatic visual changes
     */
    handleRandomize() {
        // This should work in both modes to randomly change parameters
        // But is especially useful in automated mode
        if (this.engine.automationManager) {
            const newParams = this.engine.automationManager.randomizeAllParameters();
            
            // Flash message to user indicating randomization happened
            this.uiManager.showTemporaryMessage('✨ Parameters Randomized! ✨', 1500);
            
            // Update UI display with new parameters
            this.uiManager.updateAnimationDisplay(
                this.engine.config.animationType, 
                this.animations, 
                this.engine.config
            );
            
            // If in manual mode, refresh control display to show new values
            if (!this.engine.config.isAutomatedMode) {
                this.uiManager.updateModeDisplay(false);
            }
        }
    }
}

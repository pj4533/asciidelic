/**
 * Input Manager - Handles user input for AsciiDelic
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
        
        // Set up default bindings
        if (engine && uiManager && animations) {
            this.setupDefaultBindings();
        }
    }
    
    /**
     * Set the engine reference
     * @param {Object} engine - AsciiEngine instance
     */
    setEngine(engine) {
        this.engine = engine;
    }
    
    /**
     * Set the UI manager reference
     * @param {Object} uiManager - UIManager instance
     */
    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }
    
    /**
     * Set the animations reference
     * @param {Array} animations - Available animations
     */
    setAnimations(animations) {
        this.animations = animations;
    }
    
    /**
     * Set up the default key bindings
     */
    setupDefaultBindings() {
        // Animation navigation - always active regardless of mode
        this.bindKey('ArrowUp', this.handleAnimationUp.bind(this));
        this.bindKey('ArrowDown', this.handleAnimationDown.bind(this));
        
        // Mode toggle
        this.bindKey('m', this.handleModeToggle.bind(this));
        this.bindKey('M', this.handleModeToggle.bind(this));
        
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
        
        // Enable keyboard events
        this.enableKeyboardEvents();
    }
    
    /**
     * Handle animation up (next animation)
     */
    handleAnimationUp() {
        const currentIdx = this.engine.config.animationType;
        const newIdx = (currentIdx + 1) % this.animations.length;
        this.engine.updateConfig({ animationType: newIdx });
        this.engine.setAnimation(this.animations[newIdx].id);
        this.uiManager.updateAnimationDisplay(newIdx, this.animations, this.engine.config);
    }
    
    /**
     * Handle animation down (previous animation)
     */
    handleAnimationDown() {
        const currentIdx = this.engine.config.animationType;
        const newIdx = (currentIdx - 1 + this.animations.length) % this.animations.length;
        this.engine.updateConfig({ animationType: newIdx });
        this.engine.setAnimation(this.animations[newIdx].id);
        this.uiManager.updateAnimationDisplay(newIdx, this.animations, this.engine.config);
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
     * Bind a key to a function
     * @param {string} key - Key to bind
     * @param {Function} callback - Function to call when key is pressed
     */
    bindKey(key, callback) {
        this.keyBindings.set(key, callback);
    }
    
    /**
     * Handle keydown event
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        const callback = this.keyBindings.get(event.key);
        if (callback) {
            callback();
        }
    }
    
    /**
     * Enable keyboard events
     */
    enableKeyboardEvents() {
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
}
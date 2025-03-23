/**
 * Input Manager - Central system for handling user input in AsciiDelic
 */
import { createInputHandlers } from './inputHandlers.js';

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
        
        // Create action handlers
        if (engine && uiManager && animations) {
            this.actionHandlers = createInputHandlers(engine, uiManager, animations);
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
        this.bindKey('ArrowUp', this.actionHandlers.handleAnimationPrevious.bind(this.actionHandlers));
        this.bindKey('ArrowDown', this.actionHandlers.handleAnimationNext.bind(this.actionHandlers));
        
        // Mode toggle
        this.bindKey('m', this.actionHandlers.handleModeToggle.bind(this.actionHandlers));
        this.bindKey('M', this.actionHandlers.handleModeToggle.bind(this.actionHandlers));
        
        // Randomize parameters
        this.bindKey('r', this.actionHandlers.handleRandomize.bind(this.actionHandlers));
        this.bindKey('R', this.actionHandlers.handleRandomize.bind(this.actionHandlers));
        
        // Manual mode controls
        this.bindKey('ArrowRight', this.actionHandlers.handleColorRight.bind(this.actionHandlers));
        this.bindKey('ArrowLeft', this.actionHandlers.handleColorLeft.bind(this.actionHandlers));
        this.bindKey(' ', this.actionHandlers.handleColorMode.bind(this.actionHandlers));
        
        // Speed controls
        this.bindKey('+', this.actionHandlers.handleSpeedIncrease.bind(this.actionHandlers));
        this.bindKey('=', this.actionHandlers.handleSpeedIncrease.bind(this.actionHandlers));
        this.bindKey('-', this.actionHandlers.handleSpeedDecrease.bind(this.actionHandlers));
        this.bindKey('_', this.actionHandlers.handleSpeedDecrease.bind(this.actionHandlers));
        
        // Density controls
        this.bindKey('d', this.actionHandlers.handleDensityIncrease.bind(this.actionHandlers));
        this.bindKey('D', this.actionHandlers.handleDensityIncrease.bind(this.actionHandlers));
        this.bindKey('s', this.actionHandlers.handleDensityDecrease.bind(this.actionHandlers));
        this.bindKey('S', this.actionHandlers.handleDensityDecrease.bind(this.actionHandlers));
    }
}
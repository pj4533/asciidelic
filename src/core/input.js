/**
 * Input.js - Handles user input for controlling animations
 */
export class InputManager {
    /**
     * Create an input manager
     * @param {Function} onConfigChange - Callback for config changes
     */
    constructor(onConfigChange = () => {}) {
        this.onConfigChange = onConfigChange;
        this.keyBindings = new Map();
        this.keysPressed = new Set();
        
        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Set up keyboard and mouse event listeners
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
            const action = this.keyBindings.get(event.key);
            action.callback(action.params);
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
            const action = this.keyBindings.get(key);
            action.callback(action.params);
        }
    }

    /**
     * Register a key binding
     * @param {string} key - Key to bind
     * @param {Function} callback - Callback function
     * @param {Object} params - Parameters to pass to the callback
     */
    bindKey(key, callback, params = {}) {
        this.keyBindings.set(key, { callback, params });
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
     * Setup default key bindings for AsciiDelic
     * @param {Function} setAnimationType - Function to set animation type
     * @param {Function} updateConfig - Function to update config
     */
    setupDefaultBindings(setAnimationType, updateConfig) {
        // Animation navigation
        this.bindKey('ArrowUp', () => {
            updateConfig({ animationType: (config) => (config.animationType - 1 + 7) % 7 });
        });
        
        this.bindKey('ArrowDown', () => {
            updateConfig({ animationType: (config) => (config.animationType + 1) % 7 });
        });
        
        // Color control
        this.bindKey('ArrowRight', () => {
            updateConfig({ targetHue: (config) => (config.targetHue + 30) % 360 });
        });
        
        this.bindKey('ArrowLeft', () => {
            updateConfig({ targetHue: (config) => (config.targetHue - 30 + 360) % 360 });
        });
        
        // Color mode
        this.bindKey(' ', () => {
            updateConfig({ colorMode: (config) => (config.colorMode + 1) % 4 });
        });
        
        // Speed control
        this.bindKey('+', () => {
            updateConfig({ speed: (config) => Math.min(config.speed + 0.1, 3.0) });
        });
        
        this.bindKey('-', () => {
            updateConfig({ speed: (config) => Math.max(config.speed - 0.1, 0.2) });
        });
        
        // Density control
        this.bindKey('d', () => {
            updateConfig({ density: (config) => Math.min(config.density + 0.1, 1.0) });
        });
        
        this.bindKey('s', () => {
            updateConfig({ density: (config) => Math.max(config.density - 0.1, 0.1) });
        });
    }
}
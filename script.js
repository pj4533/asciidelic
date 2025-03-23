/**
 * AsciiDelic - Main Script
 */
import { animations } from './src/animations/index.js';
import { ColorManager } from './src/utils/colorManager.js';
import { GridRenderer } from './src/core/gridRenderer.js';

// Config
const config = {
    width: 80,
    height: 40,
    animationSpeed: 60, // Frame rate in FPS
    animationType: 0,
    colorMode: 0, // 0: rainbow, 1: monochrome, 2: complementary, 3: gradient
    baseHue: 180, // initial hue
    targetHue: 180, // for smooth transitions
    hueTransitionSpeed: 0.05,
    saturation: 100,
    lightness: 50,
    density: 0.6, // character density
    speed: 1.0, // animation speed multiplier
    isAutomatedMode: true, // false: manual, true: automated parameter changes
    characters: [
        // Light dots and points
        '·', '∙', '•', '․', '⁘', '⁙', '⁚', '⋮', '⋯', '⋰', '⋱', 
        
        // Block elements with increasing density
        '░', '▒', '▓', '█', '▄', '▀', '▌', '▐', '▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟',
        
        // Box drawing elements
        '╭', '╮', '╯', '╰', '│', '─', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼', '╱', '╲', '╳',
        
        // Stars, asterisks, sparks
        '✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮', '✯', '✱', '✲', '✳', '✴', '✵', '✶', '✷', '✸', '✹', '✺', '✻', '✼',
        
        // Rounded elements and circles
        '◌', '○', '◎', '●', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◍', '◉', '⊙', '⊚', '⊛', '❀', '❁',
        
        // Diamonds and geometric
        '◇', '◈', '◆', '⟡', '⟢', '⟣', '⟤', '⟥', '⬖', '⬗', '⬘', '⬙', '⬠', '⬡',
        
        // Ornate shapes and florals
        '✿', '❀', '❁', '❂', '❃', '❇', '❈', '❉', '❊', '❋', '✽', '✾', '✿', '❆', '❅', '❄',
        
        // Miscellaneous special symbols
        '♦', '♠', '♣', '♥', '⁂', '※', '⌘', '⌥', '⌦', '⌫', '⏏', '⎔', '⎕', '⍯', '⟰', '⟱', '⟲', '⟳',
        
        // Arrows and motion indicators
        '↖', '↗', '↘', '↙', '↭', '↝', '↞', '↠', '↢', '↣', '↭', '↯', '↺', '↻', '⇄', '⇅', '⇆', '⇇', '⇈',
        
        // Mathematical and currency
        '∞', '∆', '∇', '∂', '∀', '∃', '∄', '∑', '∏', '∐',
        
        // Wave/ripple like
        '∿', '≈', '≋', '≣', '≡', '≢'
    ]
};

// Time tracking
let time = 0;
let lastTime = Date.now();
let frameTime = 1000 / config.animationSpeed; // ms per frame
let characterGrid = [];
let asciiContainer;
let colorManager;
let gridRenderer;

// Initialize the character grid
function initGrid() {
    characterGrid = [];
    for (let y = 0; y < config.height; y++) {
        const row = [];
        for (let x = 0; x < config.width; x++) {
            row.push({
                character: ' ',
                hue: config.baseHue,
                saturation: config.saturation,
                lightness: config.lightness
            });
        }
        characterGrid.push(row);
    }
    
    // Add methods to the grid object
    characterGrid.width = config.width;
    characterGrid.height = config.height;
    
    characterGrid.getCell = function(x, y) {
        return this[y][x];
    };
    
    characterGrid.setCell = function(x, y, cell) {
        this[y][x] = cell;
    };
    
    characterGrid.forEach = function(callback) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                callback(x, y, this[y][x]);
            }
        }
    };
}

// Calculate hue based on color mode
function updateHue() {
    // Smoothly transition between target and current hue
    if (config.baseHue !== config.targetHue) {
        if (Math.abs(config.baseHue - config.targetHue) < config.hueTransitionSpeed) {
            config.baseHue = config.targetHue;
        } else if (config.baseHue < config.targetHue) {
            config.baseHue += config.hueTransitionSpeed;
        } else {
            config.baseHue -= config.hueTransitionSpeed;
        }
    }
}

// Main animation loop
function animate() {
    const now = Date.now();
    const delta = Math.min(now - lastTime, 100); // Cap at 100ms to prevent huge jumps
    lastTime = now;
    
    time += delta * 0.001; // Convert to seconds
    const deltaTime = delta * 0.001;
    
    // Update hue transition
    updateHue();
    
    // Update color manager
    colorManager.updateConfig(config);
    
    // Run current animation
    const currentAnimation = animations[config.animationType];
    currentAnimation.fn(characterGrid, time, deltaTime, config, config.characters, colorManager);
    
    // Render
    gridRenderer.render(characterGrid);
    
    // Next frame
    requestAnimationFrame(animate);
}

// Handle keyboard input
function setupKeyboardHandlers() {
    document.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'ArrowUp':
                config.animationType = (config.animationType + 1) % animations.length;
                updateAnimationDisplay();
                break;
            case 'ArrowDown':
                config.animationType = (config.animationType - 1 + animations.length) % animations.length;
                updateAnimationDisplay();
                break;
            case 'ArrowRight':
                if (!config.isAutomatedMode) {
                    config.targetHue = (config.targetHue + 30) % 360;
                    updateParameterDisplay();
                }
                break;
            case 'ArrowLeft':
                if (!config.isAutomatedMode) {
                    config.targetHue = (config.targetHue - 30 + 360) % 360;
                    updateParameterDisplay();
                }
                break;
            case ' ': // Space bar
                if (!config.isAutomatedMode) {
                    config.colorMode = (config.colorMode + 1) % 4;
                    updateParameterDisplay();
                }
                break;
            case '+': // Increase speed
            case '=':
                if (!config.isAutomatedMode) {
                    config.speed = Math.min(config.speed + 0.1, 3.0);
                    updateParameterDisplay();
                }
                break;
            case '-': // Decrease speed
            case '_':
                if (!config.isAutomatedMode) {
                    config.speed = Math.max(config.speed - 0.1, 0.2);
                    updateParameterDisplay();
                }
                break;
            case 'd': // Increase density
            case 'D':
                if (!config.isAutomatedMode) {
                    config.density = Math.min(config.density + 0.1, 1.0);
                    updateParameterDisplay();
                }
                break;
            case 's': // Decrease density
            case 'S':
                if (!config.isAutomatedMode) {
                    config.density = Math.max(config.density - 0.1, 0.1);
                    updateParameterDisplay();
                }
                break;
            case 'm': // Toggle mode
            case 'M':
                config.isAutomatedMode = !config.isAutomatedMode;
                updateModeDisplay();
                break;
        }
    });
}

// Update animation name display
function updateAnimationDisplay() {
    const animNameEl = document.getElementById('animation-name');
    if (animNameEl) {
        animNameEl.textContent = animations[config.animationType].name;
    }
}

// Update mode display
function updateModeDisplay() {
    const modeDisplay = document.getElementById('mode-display');
    if (modeDisplay) {
        modeDisplay.textContent = config.isAutomatedMode ? 'Automated Mode' : 'Manual Mode';
        modeDisplay.className = config.isAutomatedMode ? 'automated-mode' : 'manual-mode';
    }
    
    // Update key commands
    updateKeyCommands();
    
    // Update parameter display
    updateParameterDisplay();
}

// Update key commands display
function updateKeyCommands() {
    const keyCommands = document.getElementById('key-commands');
    if (!keyCommands) return;
    
    // Clear existing commands
    keyCommands.innerHTML = '';
    
    // Common commands
    const commonCommands = [
        { key: '↑/↓', action: 'Change animation', className: 'common-command' },
        { key: 'M', action: 'Toggle mode', className: 'common-command' }
    ];
    
    // Manual mode commands
    const manualCommands = [
        { key: '←/→', action: 'Change hue', className: 'manual-command' },
        { key: 'Space', action: 'Color mode', className: 'manual-command' },
        { key: '+/-', action: 'Speed', className: 'manual-command' },
        { key: 'S/D', action: 'Density', className: 'manual-command' }
    ];
    
    // Add common commands
    commonCommands.forEach(cmd => {
        const element = document.createElement('div');
        element.className = `key-command ${cmd.className}`;
        element.innerHTML = `<span class="key">${cmd.key}</span>: ${cmd.action}`;
        keyCommands.appendChild(element);
    });
    
    // Add manual mode commands if in manual mode
    if (!config.isAutomatedMode) {
        manualCommands.forEach(cmd => {
            const element = document.createElement('div');
            element.className = `key-command ${cmd.className}`;
            element.innerHTML = `<span class="key">${cmd.key}</span>: ${cmd.action}`;
            keyCommands.appendChild(element);
        });
    }
}

// Update parameter display
function updateParameterDisplay() {
    const paramDisplay = document.getElementById('parameter-display');
    if (!paramDisplay) return;
    
    // Clear existing parameters
    paramDisplay.innerHTML = '';
    
    // Show or hide based on mode
    paramDisplay.style.display = config.isAutomatedMode ? 'none' : 'flex';
    
    // If not in manual mode, don't show parameters
    if (config.isAutomatedMode) return;
    
    // Color mode names
    const colorModeNames = ['Rainbow', 'Monochrome', 'Complementary', 'Gradient'];
    
    // Parameters to display
    const parameters = [
        { name: 'Speed', value: config.speed.toFixed(1) },
        { name: 'Density', value: config.density.toFixed(1) },
        { name: 'Hue', value: Math.round(config.targetHue) + '°' },
        { name: 'Color Mode', value: colorModeNames[config.colorMode] }
    ];
    
    // Add parameters
    parameters.forEach(param => {
        const paramElement = document.createElement('div');
        paramElement.className = 'parameter';
        
        const nameElement = document.createElement('div');
        nameElement.className = 'parameter-name';
        nameElement.textContent = param.name;
        
        const valueElement = document.createElement('div');
        valueElement.className = 'parameter-value';
        valueElement.textContent = param.value;
        
        paramElement.appendChild(nameElement);
        paramElement.appendChild(valueElement);
        paramDisplay.appendChild(paramElement);
    });
}

// Initialize and start animation
window.onload = () => {
    asciiContainer = document.getElementById('ascii-art');
    
    // Create color manager and grid renderer
    colorManager = new ColorManager(config);
    gridRenderer = new GridRenderer(asciiContainer);
    
    // Initialize grid and controls
    initGrid();
    setupKeyboardHandlers();
    
    // Initialize UI controls
    updateAnimationDisplay();
    updateModeDisplay();
    
    // Update UI periodically
    setInterval(() => {
        updateAnimationDisplay();
        if (config.isAutomatedMode) {
            updateParameterDisplay();
        }
    }, 100);
    
    // Start animation
    animate();
};
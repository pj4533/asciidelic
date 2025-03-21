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
}

// Animation functions
const animations = [
    // Waves
    function waveAnimation() {
        const scale = 0.1;
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                const distanceToCenter = Math.sqrt(
                    Math.pow(x - config.width / 2, 2) + 
                    Math.pow(y - config.height / 2, 2)
                );
                
                const value = Math.sin(distanceToCenter * scale + time * 0.1 * config.speed);
                const normalizedValue = (value + 1) / 2; // Map from [-1, 1] to [0, 1]
                
                const charIndex = Math.floor(normalizedValue * config.characters.length * config.density);
                
                characterGrid[y][x] = {
                    character: charIndex < config.characters.length ? config.characters[charIndex] : ' ',
                    hue: getHue(x, y, distanceToCenter, normalizedValue),
                    saturation: config.saturation,
                    lightness: 50 + normalizedValue * 30
                };
            }
        }
    },
    
    // Spiral
    function spiralAnimation() {
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                const dx = x - config.width / 2;
                const dy = y - config.height / 2;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                const value = Math.sin(distance * 0.3 - time * 0.2 * config.speed + angle * 3);
                const normalizedValue = (value + 1) / 2;
                
                const charIndex = Math.floor(normalizedValue * config.characters.length * config.density);
                
                characterGrid[y][x] = {
                    character: charIndex < config.characters.length ? config.characters[charIndex] : ' ',
                    hue: getHue(x, y, distance, normalizedValue),
                    saturation: config.saturation,
                    lightness: 50 + normalizedValue * 30
                };
            }
        }
    },
    
    // Classic Tunnel
    function classicTunnelAnimation() {
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                // Create tunnel effect with zooming rings - slower speed
                const zoomFactor = 4 * config.speed; // Reduced from 10 to 4
                const ringSpacing = 5; // Increased spacing for more defined rings
                const tunnelDepth = (distance + time * zoomFactor) % ringSpacing;
                const value = (tunnelDepth / ringSpacing);
                
                // Select character based on position in tunnel
                const section = Math.floor(distance / 5) % 4; // Create segments of different character types
                const baseIndex = section * 35; // Jump to different sections of character array
                const normalizedValue = value;
                let charIndex;
                
                // Enhanced pattern to create a more structured tunnel
                if (Math.abs(tunnelDepth - ringSpacing/2) < 0.5) {
                    // Ring highlight
                    charIndex = baseIndex + Math.floor(normalizedValue * 25 * config.density);
                } else {
                    // Regular tunnel sections
                    charIndex = baseIndex + Math.floor(normalizedValue * 35 * config.density);
                }
                
                characterGrid[y][x] = {
                    character: charIndex < config.characters.length ? config.characters[charIndex] : '·',
                    hue: getHue(x, y, distance, normalizedValue),
                    saturation: config.saturation,
                    lightness: 50 + normalizedValue * 30
                };
            }
        }
    },
    
    // Plasma effect
    function plasmaAnimation() {
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                // Create plasma effect with multiple sine waves
                const value = 
                    Math.sin((x / config.width * 6 + time * 0.5 * config.speed)) + 
                    Math.sin((y / config.height * 6 + time * 0.5 * config.speed)) + 
                    Math.sin(((x + y) / (config.width + config.height) * 6 + time * 0.5 * config.speed)) + 
                    Math.sin((Math.sqrt(x * x + y * y) / Math.sqrt(config.width * config.width + config.height * config.height) * 6 + time * config.speed));
                
                const normalizedValue = (value + 4) / 8; // Maps [-4, 4] to [0, 1]
                const charIndex = Math.floor(normalizedValue * config.characters.length * config.density);
                
                characterGrid[y][x] = {
                    character: charIndex < config.characters.length ? config.characters[charIndex] : ' ',
                    hue: getHue(x, y, Math.sqrt(x * x + y * y), normalizedValue),
                    saturation: config.saturation,
                    lightness: 50 + normalizedValue * 30
                };
            }
        }
    },
    
    // Mandala / Circular patterns
    function mandalaAnimation() {
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                // Create circular patterns with rotating elements
                const value = Math.sin(distance * 0.8 + 
                                      Math.sin(angle * 6 + time * config.speed) + 
                                      time * 0.3 * config.speed);
                
                const normalizedValue = (value + 1) / 2;
                const charIndex = Math.floor(normalizedValue * config.characters.length * config.density);
                
                characterGrid[y][x] = {
                    character: charIndex < config.characters.length ? config.characters[charIndex] : ' ',
                    hue: getHue(x, y, distance, normalizedValue),
                    saturation: config.saturation,
                    lightness: 50 + normalizedValue * 30
                };
            }
        }
    },
    
    // Vortex Tunnel
    function vortexTunnelAnimation() {
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(dy, dx);
                
                // Create spinning tunnel effect - slower rotation
                const rotationSpeed = 0.6 * config.speed; // Reduced from 1.5 to 0.6
                const zoomFactor = 2.5 * config.speed; // Reduced from 5 to 2.5
                
                // Add rotation to the angle based on time and distance from center
                angle += time * rotationSpeed * (1 - Math.min(1, distance / (config.width / 2)));
                
                // Create a more defined tunnel wall pattern
                const ringCount = 10; // More rings
                const tunnelDepth = (distance - time * zoomFactor + angle * 0.5) % ringCount;
                const value = (tunnelDepth / ringCount);
                
                // Special character selection based on position
                let charSection, charIndex;
                
                // Use different characters for the tunnel walls and the spaces in between
                if (tunnelDepth < 1) {
                    // Use box drawing elements for the walls
                    charSection = 2; // Box drawing section in character array
                    charIndex = charSection * 18 + Math.floor(angle * 3) % 18; // Use angle to select different box chars
                } else if (tunnelDepth > ringCount - 1) {
                    // Use stars for the outer edge
                    charSection = 3; // Stars section in character array
                    charIndex = charSection * 21 + Math.floor(value * 21 * config.density);
                } else {
                    // Use geometric symbols for the general tunnel
                    charSection = 5; // Diamonds and geometric section
                    const patternValue = (value + (angle / (Math.PI * 2))) % 1; // Create spiral pattern
                    charIndex = charSection * 14 + Math.floor(patternValue * 14 * config.density);
                }
                
                // Ensure the character index doesn't exceed array bounds
                charIndex = Math.min(charIndex, config.characters.length - 1);
                
                characterGrid[y][x] = {
                    character: config.characters[charIndex],
                    hue: getHue(x, y, distance, value),
                    saturation: config.saturation,
                    lightness: 50 + value * 30
                };
            }
        }
    },
    
    // Wormhole
    function wormholeAnimation() {
        const centerX = config.width / 2;
        const centerY = config.height / 2;
        
        for (let y = 0; y < config.height; y++) {
            for (let x = 0; x < config.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                // Create wormhole with oscillating tunnel walls - slower animation
                const waveFrequency = 6; // Controls how wavy the tunnel is
                const waveAmplitude = 0.7; // Increased from 0.5 to 0.7 for more pronounced waves
                const zoomFactor = 3 * config.speed; // Reduced from 8 to 3
                
                // Add time-based color pulsing effects
                const timePulse = Math.sin(time * 1.5 * config.speed) * 0.5 + 0.5;
                
                // Create more complex wave patterns
                const primaryWave = Math.sin(angle * waveFrequency + time * 0.8 * config.speed) * waveAmplitude;
                const secondaryWave = Math.cos(angle * (waveFrequency/2) - time * 0.5 * config.speed) * (waveAmplitude * 0.5);
                const combinedWave = primaryWave + secondaryWave;
                
                // Calculate effective tunnel radius with the wave effect
                const tunnelRadius = distance + combinedWave * distance * 0.3;
                const ringCount = 8; // More defined rings
                const tunnelDepth = (tunnelRadius + time * zoomFactor) % ringCount;
                
                // Specialized character selection for wormhole
                let charIndex;
                
                // Select different character sets for different parts of the wormhole
                if (distance < 10) {
                    // Center of wormhole uses circular elements
                    const centerPattern = Math.floor((angle / (Math.PI * 2) * 18) + time * 5) % 18;
                    charIndex = 28 + centerPattern; // Rounded elements section (indexes 28-46)
                } else {
                    // Outer parts use wave-like characters
                    const section = Math.floor(angle / (Math.PI/4)) % 8;
                    
                    if (tunnelDepth < 1) {
                        // Wormhole walls use math/wave symbols
                        charIndex = 146 + (section % 6); // Wave/ripple section
                    } else if (section % 2 === 0) {
                        // Alternate between arrows and geometric shapes
                        charIndex = 40 + Math.floor(timePulse * 19); // Arrows section
                    } else {
                        // Use floral/ornate characters 
                        charIndex = 34 + Math.floor((tunnelDepth / ringCount) * 12);
                    }
                }
                
                // Ensure the index is within bounds
                charIndex = Math.min(Math.max(0, charIndex), config.characters.length - 1);
                
                // Add visual depth by adjusting lightness based on tunnel depth
                const depthLightness = 40 + (tunnelDepth / ringCount) * 40;
                
                characterGrid[y][x] = {
                    character: config.characters[charIndex],
                    hue: getHue(x, y, tunnelRadius, timePulse),
                    saturation: config.saturation,
                    lightness: depthLightness
                };
            }
        }
    }
];

// Calculate hue based on color mode
function getHue(x, y, distance, value) {
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
    
    switch(config.colorMode) {
        case 0: // Rainbow - full spectrum
            return (config.baseHue + distance * 5 + time * 10) % 360;
        case 1: // Monochrome - variations on base hue
            return config.baseHue;
        case 2: // Complementary - base hue and opposite
            return value > 0.5 ? config.baseHue : (config.baseHue + 180) % 360;
        case 3: // Gradient between two hues
            return config.baseHue + value * 60; // 60 degree spread
        default:
            return config.baseHue;
    }
}

// Render the grid to ASCII art
function render() {
    let output = '';
    for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
            const cell = characterGrid[y][x];
            if (cell.character === ' ') {
                output += ' ';
            } else {
                output += `<span style="color: hsl(${cell.hue}, ${cell.saturation}%, ${cell.lightness}%)">${cell.character}</span>`;
            }
        }
        output += '\n';
    }
    asciiContainer.innerHTML = output;
}

// Main animation loop
function animate() {
    const now = Date.now();
    const delta = Math.min(now - lastTime, 100); // Cap at 100ms to prevent huge jumps
    lastTime = now;
    
    time += delta * 0.001; // Convert to seconds
    
    // Run current animation
    animations[config.animationType]();
    
    // Render
    render();
    
    // Next frame
    requestAnimationFrame(animate);
}

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            config.animationType = (config.animationType + 1) % animations.length;
            break;
        case 'ArrowDown':
            config.animationType = (config.animationType - 1 + animations.length) % animations.length;
            break;
        case 'ArrowRight':
            config.targetHue = (config.targetHue + 30) % 360;
            break;
        case 'ArrowLeft':
            config.targetHue = (config.targetHue - 30 + 360) % 360;
            break;
        case ' ': // Space bar
            config.colorMode = (config.colorMode + 1) % 4;
            break;
        case '+': // Increase speed
        case '=':
            config.speed = Math.min(config.speed + 0.1, 3.0);
            break;
        case '-': // Decrease speed
        case '_':
            config.speed = Math.max(config.speed - 0.1, 0.2);
            break;
        case 'd': // Increase density
        case 'D':
            config.density = Math.min(config.density + 0.1, 1.0);
            break;
        case 's': // Decrease density
        case 'S':
            config.density = Math.max(config.density - 0.1, 0.1);
            break;
    }
});

// Initialize and start animation
window.onload = () => {
    asciiContainer = document.getElementById('ascii-art');
    initGrid();
    
    // Add animation name display
    const animationNames = [
        'Waves', 'Spiral', 'Classic Tunnel', 
        'Plasma', 'Mandala', 'Vortex Tunnel', 'Wormhole'
    ];
    
    // Create animation info display
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info';
    infoDiv.innerHTML = `
        <div id="animation-name">Animation: ${animationNames[config.animationType]}</div>
        <div id="controls-hint">
            ↑/↓: Change pattern | ←/→: Shift colors | Space: Color mode | +/-: Speed | S/D: Density
        </div>
    `;
    document.getElementById('container').appendChild(infoDiv);
    
    // Update the animation name when it changes
    const animNameEl = document.getElementById('animation-name');
    setInterval(() => {
        animNameEl.textContent = `Animation: ${animationNames[config.animationType]}`;
    }, 100);
    
    animate();
};
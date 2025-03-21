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
    characters: ['·', '░', '▒', '▓', '█', '◈', '◇', '◆', '○', '●', '◌', '◍', '☆', '★', '♦', '♠', '♣', '♥', '⁂', '※', '❄', '❅', '❆', '✿', '❀', '❁']
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
                
                // Create tunnel effect with zooming rings
                const zoomFactor = 10 * config.speed; // Controls zoom speed
                const ringSpacing = 4; // Controls spacing between rings
                const tunnelDepth = (distance + time * zoomFactor) % ringSpacing;
                const value = (tunnelDepth / ringSpacing);
                
                const normalizedValue = value; 
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
                
                // Create spinning tunnel effect
                const rotationSpeed = 1.5 * config.speed;
                const zoomFactor = 5 * config.speed;
                
                // Add rotation to the angle based on time and distance from center
                angle += time * rotationSpeed * (1 - Math.min(1, distance / (config.width / 2)));
                
                // Create tunnel depth effect with both angle and distance
                const tunnelDepth = (distance - time * zoomFactor + angle * 0.5) % 8;
                const value = (tunnelDepth / 8);
                
                const normalizedValue = value;
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
                
                // Create wormhole with oscillating tunnel walls
                const waveFrequency = 6; // Controls how wavy the tunnel is
                const waveAmplitude = 0.5; // Controls wave height
                const zoomFactor = 8 * config.speed;
                
                // Modify the tunnel based on sine waves along the angle
                const waveEffect = Math.sin(angle * waveFrequency + time * 2 * config.speed) * waveAmplitude;
                const tunnelRadius = distance + waveEffect * distance * 0.2;
                const tunnelDepth = (tunnelRadius + time * zoomFactor) % 6;
                
                const value = tunnelDepth / 6;
                const normalizedValue = value;
                const charIndex = Math.floor(normalizedValue * config.characters.length * config.density);
                
                characterGrid[y][x] = {
                    character: charIndex < config.characters.length ? config.characters[charIndex] : ' ',
                    hue: getHue(x, y, tunnelRadius, normalizedValue),
                    saturation: config.saturation,
                    lightness: 50 + normalizedValue * 30
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
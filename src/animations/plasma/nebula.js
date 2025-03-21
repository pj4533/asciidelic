/**
 * Nebula Animation - Ethereal cosmic cloud formations that slowly transform
 */

/**
 * Create a nebula animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function nebulaAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const width = grid.width;
    const height = grid.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Define slow and fast time components for different layers
    const slowTime = time * 0.15 * config.speed;
    const mediumTime = time * 0.3 * config.speed;
    const fastTime = time * 0.45 * config.speed;
    
    grid.forEach((x, y, cell) => {
        // Calculate distance from center for radial effects
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create multiple overlapping perlin-like noise layers
        // Each layer has different frequency and speed
        const layer1 = Math.sin(dx / 10 + slowTime) * Math.cos(dy / 10 + slowTime) * 0.5;
        const layer2 = Math.sin(distance / 8 + mediumTime) * 0.3;
        const layer3 = Math.sin((dx + dy) / 12 + fastTime) * Math.cos((dx - dy) / 12 + fastTime) * 0.4;
        const layer4 = Math.sin(angle * 3 + slowTime) * 0.15;
        
        // Add some turbulence
        const turbulence = Math.sin(distance / 4 + time * config.speed) * Math.sin(angle * 2 + time * config.speed) * 0.15;
        
        // Combine layers
        const combinedValue = layer1 + layer2 + layer3 + layer4 + turbulence;
        const normalizedValue = (combinedValue + 1.5) / 3; // Normalize to [0,1]
        
        // Use different character sets for different density bands
        // This creates distinct nebula, stars, and dust regions
        let charSet;
        if (normalizedValue < 0.3) {
            // Sparse dust/empty space (dots, sparse symbols)
            charSet = characters.slice(0, 10); 
        } else if (normalizedValue < 0.65) {
            // Nebula gas (medium density characters)
            charSet = characters.slice(29, 50);
        } else {
            // Dense stellar regions (stars, bright symbols)
            charSet = characters.slice(40, 61);
        }
        
        // Apply density factor
        const index = Math.floor(normalizedValue * charSet.length * config.density);
        const safeIndex = Math.min(Math.max(0, index), charSet.length - 1);
        
        // Get color with a cosmic feel
        // Use position and value for interesting color distribution
        const hue = colorManager.getHue(x, y, distance, normalizedValue, time);
        
        // Brighter in dense regions
        const lightness = 40 + normalizedValue * 40;
        
        grid.setCell(x, y, {
            character: charSet[safeIndex],
            hue,
            saturation: colorManager.saturation,
            lightness
        });
    });
}
/**
 * Lava Lamp Animation - Smooth, floating blobs that rise and fall hypnotically
 */

/**
 * Create a lava lamp animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function lavaLampAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const width = grid.width;
    const height = grid.height;
    
    // Very slow time for lava lamp effect
    const slowTime = time * 0.2 * config.speed;
    
    // Lava blob parameters (each updates independently)
    const numBlobs = 6 + Math.floor(Math.sin(slowTime * 0.1) * 2);
    const blobs = [];
    
    // Generate lava blobs
    for (let i = 0; i < numBlobs; i++) {
        // Determine blob location and movement
        const seed = i * 1234.5678;
        
        // Horizontal position with slight wobble
        const x = width * (0.2 + 0.6 * ((i % 3) / 2) + Math.sin(slowTime * 0.3 + seed) * 0.07);
        
        // Vertical position with rising/falling movement
        // Different blobs move at different rates and phases
        const baseY = (slowTime * 0.1 + seed) % 2 - 1; // -1 to 1 sawtooth wave
        const y = height * (0.5 + baseY * 0.4);
        
        // Blob size pulses slightly
        const size = Math.min(width, height) * (0.15 + Math.sin(slowTime * 0.2 + i) * 0.03);
        
        // Blob shape varies
        const stretch = 0.8 + Math.sin(slowTime * 0.15 + seed) * 0.2;
        
        blobs.push({ x, y, size, stretch, seed });
    }
    
    // Lava-like characters (blobby, curved shapes)
    const lavaChars = [
        '○', '◎', '●', '◐', '◑', '◒', '◓',  // Circles
        '◆', '◇', '◈', // Diamonds
        '▲', '△', '▼', '▽', // Triangles
        '◉', '⦿', '⊙', '⊚', // Bullseyes
        '♠', '♥', '♦', '♣', // Card suits
        '⚫', '⚪', // Larger circles
        '❀', '❁', // Flowers
    ];
    
    grid.forEach((x, y, cell) => {
        // Calculate blob influence at this point
        let totalInfluence = 0;
        
        for (const blob of blobs) {
            // Calculate distance to blob center (with stretch factor)
            const dx = (x - blob.x) / blob.stretch;
            const dy = (y - blob.y) * blob.stretch;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Blob field strength (stronger near center)
            // Square for sharper edges, cube for even sharper
            const blobField = Math.max(0, 1 - (distance / blob.size));
            const influence = blobField * blobField * blobField;
            
            totalInfluence += influence;
        }
        
        // Normalize to [0,1] range with saturation at 1
        const normalizedValue = Math.min(1, totalInfluence);
        
        // Add subtle texture/noise to the field
        const noiseValue = Math.sin(x * 0.3 + y * 0.3 + slowTime) * 0.1;
        const finalValue = Math.max(0, Math.min(1, normalizedValue + noiseValue));
        
        // Select character based on influence
        let charIndex;
        if (finalValue < 0.2) {
            // Background/empty space (dots or nothing)
            charIndex = 0;
        } else if (finalValue < 0.6) {
            // Blob edges (medium density)
            charIndex = Math.floor(finalValue * 8 * config.density);
        } else {
            // Blob interior (denser characters)
            charIndex = Math.floor(8 + finalValue * (lavaChars.length - 8) * config.density);
        }
        
        const safeIndex = Math.min(Math.max(0, charIndex), lavaChars.length - 1);
        
        // Lava color effect
        // Base color shifts slowly over time
        const baseHue = (slowTime * 5) % 360;
        // Adjust hue based on vertical position for temperature gradient
        const relativeY = y / height;
        const tempOffset = (1 - relativeY) * 30; // Hotter at bottom
        
        // Get final hue with slight noise for variety
        const hue = (baseHue + tempOffset + normalizedValue * 20) % 360;
        
        // Brighter inside blobs
        const lightness = 30 + finalValue * 40;
        
        grid.setCell(x, y, {
            character: lavaChars[safeIndex],
            hue,
            saturation: colorManager.saturation,
            lightness
        });
    });
}
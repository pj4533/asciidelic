/**
 * Classic Tunnel Animation - Pulsing circular tunnel effect
 */
export function classicTunnelAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const centerX = grid.width / 2;
    const centerY = grid.height / 2;
    
    grid.forEach((x, y, cell) => {
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
        
        grid.setCell(x, y, {
            character: charIndex < characters.length ? characters[charIndex] : '·',
            hue: colorManager.getHue(x, y, distance, normalizedValue, time),
            saturation: colorManager.saturation,
            lightness: 50 + normalizedValue * 30
        });
    });
}
/**
 * Vortex Tunnel Animation - Spinning tunnel effect with detailed walls
 */
export function vortexTunnelAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const centerX = grid.width / 2;
    const centerY = grid.height / 2;
    
    grid.forEach((x, y, cell) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);
        
        // Create spinning tunnel effect - slower rotation
        const rotationSpeed = 0.6 * config.speed; // Reduced from 1.5 to 0.6
        const zoomFactor = 2.5 * config.speed; // Reduced from 5 to 2.5
        
        // Add rotation to the angle based on time and distance from center
        angle += time * rotationSpeed * (1 - Math.min(1, distance / (grid.width / 2)));
        
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
        charIndex = Math.min(charIndex, characters.length - 1);
        
        grid.setCell(x, y, {
            character: characters[charIndex],
            hue: colorManager.getHue(x, y, distance, value, time),
            saturation: colorManager.saturation,
            lightness: 50 + value * 30
        });
    });
}
/**
 * Mandala Animation - Circular patterns with rotating elements
 */
export function mandalaAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const centerX = grid.width / 2;
    const centerY = grid.height / 2;
    
    grid.forEach((x, y, cell) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create circular patterns with rotating elements
        const value = Math.sin(distance * 0.8 + 
                              Math.sin(angle * 6 + time * config.speed) + 
                              time * 0.3 * config.speed);
        
        const normalizedValue = (value + 1) / 2;
        const charIndex = Math.floor(normalizedValue * characters.length * config.density);
        
        grid.setCell(x, y, {
            character: charIndex < characters.length ? characters[charIndex] : ' ',
            hue: colorManager.getHue(x, y, distance, normalizedValue, time),
            saturation: colorManager.saturation,
            lightness: 50 + normalizedValue * 30
        });
    });
}
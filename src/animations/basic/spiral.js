/**
 * Spiral Animation - Dynamic spiraling patterns
 */
export function spiralAnimation(grid, time, deltaTime, config, characters, colorManager) {
    grid.forEach((x, y, cell) => {
        const dx = x - grid.width / 2;
        const dy = y - grid.height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const value = Math.sin(distance * 0.3 - time * 0.2 * config.speed + angle * 3);
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
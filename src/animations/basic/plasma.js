/**
 * Plasma Animation - Classic plasma effect with sine waves
 */
export function plasmaAnimation(grid, time, deltaTime, config, characters, colorManager) {
    grid.forEach((x, y, cell) => {
        // Create plasma effect with multiple sine waves
        const value = 
            Math.sin((x / grid.width * 6 + time * 0.5 * config.speed)) + 
            Math.sin((y / grid.height * 6 + time * 0.5 * config.speed)) + 
            Math.sin(((x + y) / (grid.width + grid.height) * 6 + time * 0.5 * config.speed)) + 
            Math.sin((Math.sqrt(x * x + y * y) / Math.sqrt(grid.width * grid.width + grid.height * grid.height) * 6 + time * config.speed));
        
        const normalizedValue = (value + 4) / 8; // Maps [-4, 4] to [0, 1]
        const charIndex = Math.floor(normalizedValue * characters.length * config.density);
        
        grid.setCell(x, y, {
            character: charIndex < characters.length ? characters[charIndex] : ' ',
            hue: colorManager.getHue(x, y, Math.sqrt(x * x + y * y), normalizedValue, time),
            saturation: colorManager.saturation,
            lightness: 50 + normalizedValue * 30
        });
    });
}
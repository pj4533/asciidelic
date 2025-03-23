/**
 * Wave Animation - Concentric wave patterns
 */
export function waveAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const scale = 0.1;
    
    grid.forEach((x, y, cell) => {
        const distanceToCenter = Math.sqrt(
            Math.pow(x - grid.width / 2, 2) + 
            Math.pow(y - grid.height / 2, 2)
        );
        
        const value = Math.sin(distanceToCenter * scale + time * 0.1 * config.speed);
        const normalizedValue = (value + 1) / 2; // Map from [-1, 1] to [0, 1]
        
        const charIndex = Math.floor(normalizedValue * characters.length * config.density);
        
        grid.setCell(x, y, {
            character: charIndex < characters.length ? characters[charIndex] : ' ',
            hue: colorManager.getHue(x, y, distanceToCenter, normalizedValue, time),
            saturation: colorManager.saturation,
            lightness: 50 + normalizedValue * 30
        });
    });
}
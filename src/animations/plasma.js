/**
 * Plasma Animation - A fluid plasma-like effect with flowing patterns
 */

/**
 * Create a plasma animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function plasmaAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const width = grid.width;
    const height = grid.height;
    
    grid.forEach((x, y, cell) => {
        // Create plasma effect with multiple sine waves
        const value = 
            Math.sin((x / width * 6 + time * 0.5 * config.speed)) + 
            Math.sin((y / height * 6 + time * 0.5 * config.speed)) + 
            Math.sin(((x + y) / (width + height) * 6 + time * 0.5 * config.speed)) + 
            Math.sin((Math.sqrt(x * x + y * y) / Math.sqrt(width * width + height * height) * 6 + time * config.speed));
        
        const normalizedValue = (value + 4) / 8; // Maps [-4, 4] to [0, 1]
        
        // Select character based on plasma intensity
        // Choose which character set to use based on the value
        let charSet;
        if (normalizedValue < 0.33) {
            // Use dots for low values
            charSet = characters.slice(0, 11);
        } else if (normalizedValue < 0.66) {
            // Use blocks or math symbols for medium values
            charSet = characters.slice(11, 29).concat(characters.slice(127, 137));
        } else {
            // Use stars or waves for high values
            charSet = characters.slice(29, 47).concat(characters.slice(137, 143));
        }
        
        const charIndex = Math.floor(normalizedValue * charSet.length * config.density);
        
        // Ensure the index is within bounds
        const safeIndex = Math.min(Math.max(0, charIndex), charSet.length - 1);
        
        // Get color
        const distance = Math.sqrt(x * x + y * y);
        const hue = colorManager.getHue(x, y, distance, normalizedValue, time);
        const lightness = 50 + normalizedValue * 30;
        
        grid.setCell(x, y, {
            character: charSet[safeIndex],
            hue,
            saturation: colorManager.saturation,
            lightness
        });
    });
}
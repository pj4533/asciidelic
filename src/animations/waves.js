/**
 * Waves animation - Concentric wave patterns
 */
import { oscillate } from '../utils/math.js';

/**
 * Create a wave animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function waveAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const centerX = grid.width / 2;
    const centerY = grid.height / 2;
    const scale = 0.1;
    
    grid.forEach((x, y, cell) => {
        const distanceToCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + 
            Math.pow(y - centerY, 2)
        );
        
        const value = Math.sin(distanceToCenter * scale + time * 0.1 * config.speed);
        const normalizedValue = (value + 1) / 2; // Map from [-1, 1] to [0, 1]
        
        // Create more dynamic waves by having multiple wave frequencies
        const secondaryWave = Math.sin(distanceToCenter * 0.2 + time * 0.2 * config.speed);
        const secondaryValue = (secondaryWave + 1) / 2;
        
        const combinedValue = (normalizedValue * 0.7 + secondaryValue * 0.3);
        
        // Add time-based pulsing to the light level
        const pulseEffect = oscillate(time, 0.2) * 0.2;
        
        // Select character based on the combined wave value
        const charIndex = Math.floor(combinedValue * characters.length * config.density);
        const character = charIndex < characters.length ? characters[charIndex] : ' ';
        
        // Get color with time factor
        const hue = colorManager.getHue(x, y, distanceToCenter, normalizedValue, time);
        const lightness = 50 + normalizedValue * 30 + pulseEffect * 10;
        
        grid.setCell(x, y, {
            character, 
            hue,
            saturation: colorManager.saturation,
            lightness
        });
    });
}
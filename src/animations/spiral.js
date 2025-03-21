/**
 * Spiral animation - Spiral patterns that rotate around the center
 */
import { oscillate } from '../utils/math.js';

/**
 * Create a spiral animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function spiralAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const centerX = grid.width / 2;
    const centerY = grid.height / 2;
    
    grid.forEach((x, y, cell) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create a spiral pattern that rotates outward
        const spiralFactor = 3 + oscillate(time, 0.1) * 0.5; // Slowly oscillating spiral density
        const value = Math.sin(distance * 0.3 - time * 0.2 * config.speed + angle * spiralFactor);
        const normalizedValue = (value + 1) / 2;
        
        // Create a secondary spiral with different frequency going the opposite direction
        const counterSpiralFactor = 2;
        const counterSpiralValue = Math.sin(distance * 0.2 + time * 0.15 * config.speed - angle * counterSpiralFactor);
        const normalizedCounterValue = (counterSpiralValue + 1) / 2;
        
        // Blend the two spiral patterns
        const blendFactor = oscillate(time, 0.05); // Slowly oscillate the blend
        const combinedValue = normalizedValue * (1 - blendFactor * 0.3) + normalizedCounterValue * (blendFactor * 0.3);
        
        // Select character based on the combined value
        const charIndex = Math.floor(combinedValue * characters.length * config.density);
        const character = charIndex < characters.length ? characters[charIndex] : ' ';
        
        // Get color with time factor and angle influence for color banding
        const hue = colorManager.getHue(x, y, distance, normalizedValue + angle / (Math.PI * 2), time);
        const lightness = 50 + normalizedValue * 30;
        
        grid.setCell(x, y, {
            character,
            hue,
            saturation: colorManager.saturation,
            lightness
        });
    });
}
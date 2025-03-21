/**
 * Mandala Animation - Circular patterns that form mandala-like designs
 */
import { oscillate } from '../utils/math.js';

/**
 * Create a mandala animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function mandalaAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const centerX = grid.width / 2;
    const centerY = grid.height / 2;
    
    // Dynamic mandala parameters
    const petalCount = 6 + Math.floor(oscillate(time, 0.05) * 4); // Slowly changing petal count
    const rotationSpeed = 0.3 * config.speed;
    
    grid.forEach((x, y, cell) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create circular patterns with rotating elements
        const petalValue = Math.sin(angle * petalCount + time * rotationSpeed);
        const distanceValue = Math.sin(distance * 0.8);
        const timeValue = Math.sin(time * 0.3 * config.speed);
        
        const value = (petalValue + distanceValue + timeValue);
        const normalizedValue = (value + 3) / 6; // Map [-3, 3] to [0, 1]
        
        // Select different character sets for different parts of the mandala
        let charSet;
        
        if (distance < 5) {
            // Center of the mandala
            charSet = characters.slice(47, 66); // Circles
        } else if (distance < 15) {
            // Inner ring
            charSet = characters.slice(99, 118); // Arrows
        } else if (Math.abs(petalValue) > 0.7) {
            // Petal patterns
            charSet = characters.slice(80, 99); // Ornate/floral
        } else {
            // Background patterns
            charSet = characters.slice(29, 47); // Stars
        }
        
        const charIndex = Math.floor(normalizedValue * charSet.length * config.density);
        const safeIndex = Math.min(Math.max(0, charIndex), charSet.length - 1);
        
        // Color based on angle and distance
        const hue = colorManager.getHue(x, y, distance, (angle + Math.PI) / (Math.PI * 2), time);
        const lightness = 50 + normalizedValue * 30;
        
        grid.setCell(x, y, {
            character: charSet[safeIndex],
            hue,
            saturation: colorManager.saturation,
            lightness
        });
    });
}
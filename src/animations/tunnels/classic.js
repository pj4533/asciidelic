/**
 * Classic Tunnel Animation - A tunnel with zooming rings
 */
import { clamp } from '../../utils/math.js';

/**
 * Create a classic tunnel animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function tunnelAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const centerX = grid.width / 2;
    const centerY = grid.height / 2;
    
    // Slower tunnel movement
    const zoomFactor = 4 * config.speed; // Controls zoom speed
    const ringSpacing = 5; // Controls spacing between rings
    
    grid.forEach((x, y, cell) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create tunnel effect with zooming rings
        const tunnelDepth = (distance + time * zoomFactor) % ringSpacing;
        const value = (tunnelDepth / ringSpacing);
        
        // Select character based on position in tunnel
        const section = Math.floor(distance / 5) % 4; // Create segments of different character types
        
        // Use different character sets for different sections of the tunnel
        let charSet;
        switch (section) {
            case 0:
                charSet = characters.slice(0, 11); // Dots
                break;
            case 1:
                charSet = characters.slice(11, 29); // Blocks
                break;
            case 2:
                charSet = characters.slice(47, 66); // Circles
                break;
            case 3:
                charSet = characters.slice(66, 80); // Geometric
                break;
            default:
                charSet = characters;
        }
        
        let charIndex;
        
        // Enhanced pattern to create a more structured tunnel
        if (Math.abs(tunnelDepth - ringSpacing/2) < 0.5) {
            // Ring highlight - use a subset of the character set for highlights
            charIndex = Math.floor(value * charSet.length * config.density * 0.8);
        } else {
            // Regular tunnel sections
            charIndex = Math.floor(value * charSet.length * config.density);
        }
        
        // Ensure the index is within bounds
        charIndex = clamp(charIndex, 0, charSet.length - 1);
        
        // Get color
        const hue = colorManager.getHue(x, y, distance, value, time);
        const lightness = 50 + value * 30;
        
        grid.setCell(x, y, {
            character: charSet[charIndex],
            hue,
            saturation: colorManager.saturation,
            lightness
        });
    });
}
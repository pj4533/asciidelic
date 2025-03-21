/**
 * Vortex Tunnel Animation - A tunnel with rotating vortex effects
 */
import { clamp } from '../../utils/math.js';

/**
 * Create a vortex tunnel animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function vortexTunnelAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const centerX = grid.width / 2;
    const centerY = grid.height / 2;
    
    // Slower vortex movement
    const rotationSpeed = 0.6 * config.speed;
    const zoomFactor = 2.5 * config.speed;
    const ringCount = 10; // More rings for a smoother tunnel
    
    grid.forEach((x, y, cell) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);
        
        // Add rotation to the angle based on time and distance from center
        angle += time * rotationSpeed * (1 - Math.min(1, distance / (centerX)));
        
        // Create tunnel depth effect with both angle and distance
        const tunnelDepth = (distance - time * zoomFactor + angle * 0.5) % ringCount;
        const value = (tunnelDepth / ringCount);
        
        // Use different characters for the tunnel walls and the spaces in between
        let charSet;
        
        if (tunnelDepth < 1) {
            // Use box drawing elements for the walls
            charSet = characters.slice(29, 47); // Box drawing and arrows
        } else if (tunnelDepth > ringCount - 1) {
            // Use stars for the outer edge
            charSet = characters.slice(29, 50); // Stars and geometric
        } else {
            // Use geometric symbols for the general tunnel
            const section = Math.floor(angle / (Math.PI/4)) % 4;
            
            switch(section) {
                case 0:
                    charSet = characters.slice(66, 80); // Geometric
                    break;
                case 1:
                    charSet = characters.slice(80, 99); // Ornate
                    break;
                case 2:
                    charSet = characters.slice(99, 118); // Arrows
                    break;
                case 3:
                default:
                    charSet = characters.slice(47, 66); // Circles
                    break;
            }
        }
        
        // Create spiral pattern in the tunnel
        const patternValue = (value + (angle / (Math.PI * 2))) % 1;
        const charIndex = Math.floor(patternValue * charSet.length * config.density);
        
        // Ensure the index is within bounds
        const safeIndex = clamp(charIndex, 0, charSet.length - 1);
        
        // Color the tunnel with a more dynamic color pattern
        const hue = colorManager.getHue(x, y, distance, patternValue, time);
        const lightness = 50 + value * 30;
        
        grid.setCell(x, y, {
            character: charSet[safeIndex],
            hue,
            saturation: colorManager.saturation,
            lightness
        });
    });
}
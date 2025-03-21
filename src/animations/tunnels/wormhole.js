/**
 * Wormhole Animation - A wormhole with oscillating tunnel walls
 */
import { oscillate, clamp } from '../../utils/math.js';

/**
 * Create a wormhole animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function wormholeAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const centerX = grid.width / 2;
    const centerY = grid.height / 2;
    
    // Wormhole parameters
    const waveFrequency = 6; // Controls how wavy the tunnel is
    const waveAmplitude = 0.7; // Wave height
    const zoomFactor = 3 * config.speed; // Slower zoom for more detail
    const ringCount = 8; // Number of rings in the wormhole
    
    // Time-based pulsing effects
    const timePulse = oscillate(time, 1.5 * config.speed);
    
    grid.forEach((x, y, cell) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create complex wave patterns
        const primaryWave = Math.sin(angle * waveFrequency + time * 0.8 * config.speed) * waveAmplitude;
        const secondaryWave = Math.cos(angle * (waveFrequency/2) - time * 0.5 * config.speed) * (waveAmplitude * 0.5);
        const combinedWave = primaryWave + secondaryWave;
        
        // Calculate effective tunnel radius with the wave effect
        const tunnelRadius = distance + combinedWave * distance * 0.3;
        const tunnelDepth = (tunnelRadius + time * zoomFactor) % ringCount;
        
        // Different character sets for different parts of the wormhole
        let charSet;
        
        if (distance < 10) {
            // Center of wormhole
            charSet = characters.slice(47, 66); // Circles
            
            // Add rotation to the center elements
            const centerPattern = Math.floor((angle / (Math.PI * 2) * 18) + time * 5) % charSet.length;
            const safeIndex = clamp(centerPattern, 0, charSet.length - 1);
            
            // Visual depth using lightness
            const depthLightness = 50 + timePulse * 30;
            
            grid.setCell(x, y, {
                character: charSet[safeIndex],
                hue: colorManager.getHue(x, y, 0, timePulse, time),
                saturation: colorManager.saturation,
                lightness: depthLightness
            });
            return; // End callback early for center elements
        }
        
        // Character selection for the tunnel walls and sections
        const section = Math.floor(angle / (Math.PI/4)) % 8;
        
        if (tunnelDepth < 1) {
            // Wormhole walls
            charSet = characters.slice(137, 143); // Wave/ripple symbols
        } else if (section % 2 === 0) {
            // Alternate between arrows and geometric shapes
            charSet = characters.slice(99, 118); // Arrows
        } else {
            // Ornate elements for other sections
            charSet = characters.slice(80, 99); // Ornate/floral
        }
        
        // Select character based on tunnel depth and angle
        const charValue = (tunnelDepth / ringCount) + (angle / (Math.PI * 2)) * 0.5;
        const charIndex = Math.floor(charValue * charSet.length * config.density) % charSet.length;
        const safeIndex = clamp(charIndex, 0, charSet.length - 1);
        
        // Add visual depth with varying lightness
        const depthLightness = 40 + (tunnelDepth / ringCount) * 40;
        
        grid.setCell(x, y, {
            character: charSet[safeIndex],
            hue: colorManager.getHue(x, y, tunnelRadius, timePulse, time),
            saturation: colorManager.saturation,
            lightness: depthLightness
        });
    });
}
/**
 * Flow Field Animation - Currents and streams flowing in a dynamic fluid pattern
 */

/**
 * Create a flow field animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function flowFieldAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const width = grid.width;
    const height = grid.height;
    
    // Slower speed factor for a more fluid motion
    const speedFactor = config.speed * 0.2;
    
    // Get arrow and flow characters 
    const flowChars = [
        '←', '↑', '→', '↓', // Cardinal directions
        '↖', '↗', '↘', '↙', // Diagonal directions
        '⇠', '⇡', '⇢', '⇣', // Alternate arrows
        '≈', '∿', '≋', // Waves
        '~', // Tilde
        '.', ',', '·', ':', // Dots
        '⋮', '⋯', '⋰', '⋱', // More dots
    ];
    
    // Create a smooth, evolving vector field
    const noiseScale = 0.1;
    
    grid.forEach((x, y, cell) => {
        // Calculate flow direction using noise fields
        // Use different frequencies and offsets to create complex flows
        const angleOffset1 = Math.sin(x * noiseScale + time * speedFactor) * Math.cos(y * noiseScale + time * speedFactor);
        const angleOffset2 = Math.sin((x + y) * noiseScale * 0.5 + time * speedFactor * 0.7) * 
                           Math.cos((x - y) * noiseScale * 0.5 + time * speedFactor * 0.7);
        
        // Create swirling eddies
        const cx = width / 2;
        const cy = height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const swirl = Math.sin(dist * 0.2 - time * speedFactor) * 0.5;
        
        // Combine the effects
        const angle = angleOffset1 * Math.PI + angleOffset2 * Math.PI * 0.7 + swirl;
        
        // Get the normalized vector direction (0-1)
        // Map angle from [-π, π] to [0, 1]
        const normalizedAngle = (angle + Math.PI) / (Math.PI * 2);
        
        // Get flow intensity (0-1)
        const intensity = 0.3 + 
                        Math.abs(angleOffset1) * 0.4 + 
                        Math.abs(swirl) * 0.3;
        
        // Select character based on flow direction and intensity
        // Map angle to character index to get appropriate directional character
        const charCount = flowChars.length * config.density;
        const charIndex = Math.floor((normalizedAngle * 8 + intensity * charCount * 0.5) % charCount);
        const safeIndex = Math.min(Math.max(0, charIndex), flowChars.length - 1);
                
        // Get color based on flow direction and intensity
        const hue = colorManager.getHue(x, y, dist, normalizedAngle, time);
        
        // Use full saturation from color manager
        const saturation = colorManager.saturation;
        // Brighter for stronger flows
        const lightness = 40 + intensity * 35;
        
        grid.setCell(x, y, {
            character: flowChars[safeIndex],
            hue,
            saturation: colorManager.saturation,
            lightness
        });
    });
}
/**
 * Wormhole Animation - Dynamic wormhole with oscillating tunnel walls
 */
export function wormholeAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const centerX = grid.width / 2;
    const centerY = grid.height / 2;
    
    grid.forEach((x, y, cell) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create wormhole with oscillating tunnel walls - slower animation
        const waveFrequency = 6; // Controls how wavy the tunnel is
        const waveAmplitude = 0.7; // Increased from 0.5 to 0.7 for more pronounced waves
        const zoomFactor = 3 * config.speed; // Reduced from 8 to 3
        
        // Add time-based color pulsing effects
        const timePulse = Math.sin(time * 1.5 * config.speed) * 0.5 + 0.5;
        
        // Create more complex wave patterns
        const primaryWave = Math.sin(angle * waveFrequency + time * 0.8 * config.speed) * waveAmplitude;
        const secondaryWave = Math.cos(angle * (waveFrequency/2) - time * 0.5 * config.speed) * (waveAmplitude * 0.5);
        const combinedWave = primaryWave + secondaryWave;
        
        // Calculate effective tunnel radius with the wave effect
        const tunnelRadius = distance + combinedWave * distance * 0.3;
        const ringCount = 8; // More defined rings
        const tunnelDepth = (tunnelRadius + time * zoomFactor) % ringCount;
        
        // Specialized character selection for wormhole
        let charIndex;
        
        // Select different character sets for different parts of the wormhole
        if (distance < 10) {
            // Center of wormhole uses circular elements
            const centerPattern = Math.floor((angle / (Math.PI * 2) * 18) + time * 5) % 18;
            charIndex = 28 + centerPattern; // Rounded elements section (indexes 28-46)
        } else {
            // Outer parts use wave-like characters
            const section = Math.floor(angle / (Math.PI/4)) % 8;
            
            if (tunnelDepth < 1) {
                // Wormhole walls use math/wave symbols
                charIndex = 146 + (section % 6); // Wave/ripple section
            } else if (section % 2 === 0) {
                // Alternate between arrows and geometric shapes
                charIndex = 40 + Math.floor(timePulse * 19); // Arrows section
            } else {
                // Use floral/ornate characters 
                charIndex = 34 + Math.floor((tunnelDepth / ringCount) * 12);
            }
        }
        
        // Ensure the index is within bounds
        charIndex = Math.min(Math.max(0, charIndex), characters.length - 1);
        
        // Add visual depth by adjusting lightness based on tunnel depth
        const depthLightness = 40 + (tunnelDepth / ringCount) * 40;
        
        grid.setCell(x, y, {
            character: characters[charIndex],
            hue: colorManager.getHue(x, y, tunnelRadius, timePulse, time),
            saturation: colorManager.saturation,
            lightness: depthLightness
        });
    });
}
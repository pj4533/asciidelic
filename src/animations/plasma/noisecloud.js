/**
 * Cloud Formations Animation - Billowing clouds that drift and change shape
 */

/**
 * Create a cloud formations animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function noiseCloudAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const width = grid.width;
    const height = grid.height;
    
    // Very slow time for cloud-like movement
    const slowTime = time * 0.1 * config.speed;
    const mediumTime = time * 0.2 * config.speed;
    
    // Cloud characters (puffy, light, airy)
    const cloudChars = [
        '·', ':', '⋅', '⋯', // Dots
        '○', '◦', '◯', '⊙', // Circles
        '░', '▒', '▓', // Block elements
        '♡', '♥', // Hearts
        '✿', '❀', '✾', // Flowers
        '★', '☆', '✧', '✦', // Stars
        '☁', '❅', '❆', '❄', // Weather symbols
    ];
    
    // Generate cloud formations using 3D noise
    grid.forEach((x, y, cell) => {
        // Multiple noise functions at different scales for natural look
        
        // Large, slow-moving formations
        const largeScale = 0.05;
        const large = Math.sin(x * largeScale + slowTime * 0.3) * 
                     Math.cos(y * largeScale + slowTime * 0.2) * 0.5;
        
        // Medium formations that move a bit faster
        const mediumScale = 0.1;
        const medium = Math.sin((x + y) * mediumScale + mediumTime * 0.4) * 
                      Math.cos((x - y) * mediumScale + mediumTime * 0.3) * 0.3;
        
        // Small detail formations
        const smallScale = 0.2;
        const small = Math.sin(x * smallScale + mediumTime * 0.5) * 
                     Math.sin(y * smallScale + mediumTime * 0.6) * 0.2;
        
        // Wind effect - horizontal drift
        const windEffect = Math.sin((y * 0.05) + (slowTime * 0.1)) * 0.1;
        
        // Vertical position effect - more clouds in upper areas
        const heightEffect = Math.max(0, 1 - (y / height) * 1.5) * 0.3;
        
        // Combine all effects
        let cloudDensity = large + medium + small + windEffect + heightEffect;
        
        // Normalize and apply threshold for cloud formations
        const normalizedDensity = (cloudDensity + 1) / 2; // Map from [-1,1] to [0,1]
        
        // Create cloud boundaries with threshold
        const cloudThreshold = 0.4;
        const cloudValue = Math.max(0, (normalizedDensity - cloudThreshold) / (1 - cloudThreshold));
        
        // Select character based on cloud density
        const charIndex = Math.floor(cloudValue * cloudChars.length * config.density);
        const safeIndex = Math.min(Math.max(0, charIndex), cloudChars.length - 1);
        
        // Cloud color calculation
        // Base on height (higher clouds catch different light)
        const heightRatio = 1 - (y / height);
        
        // Get time-varying hue from the color manager
        const baseHue = colorManager.getHue(x, y, 0, normalizedDensity, time);
        
        // Cloud coloring - vibrant colorful clouds
        const hue = baseHue;
        const saturation = 80 + cloudValue * 20; // Higher saturation for colorful clouds
        const lightness = 50 + cloudValue * 40; // Full range of brightness
        
        grid.setCell(x, y, {
            character: cloudChars[safeIndex],
            hue,
            saturation,
            lightness
        });
    });
}
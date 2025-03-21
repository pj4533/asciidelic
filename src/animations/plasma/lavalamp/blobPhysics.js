/**
 * Blob physics simulation for lava lamp animation
 */

/**
 * Calculate fluid current at a position
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} containerLeft - Left edge of container 
 * @param {number} containerTop - Top edge of container
 * @param {number} containerBottom - Bottom edge of container
 * @param {number} width - Grid width
 * @param {number} heatVariation - Heat variation parameter
 * @returns {number} Current strength
 */
export function calculateCurrent(x, y, containerLeft, containerTop, containerBottom, width, heatVariation) {
    // Distance from center X
    const centerX = width / 2;
    const distFromCenter = Math.abs(x - centerX) / (width / 2);
    
    // Vertical position affects current
    const normalizedY = (y - containerTop) / (containerBottom - containerTop);
    
    // Central rising current (stronger in middle, changes over time)
    const centralCurrent = Math.max(0, 0.5 - distFromCenter) * Math.sin(normalizedY * Math.PI) * (0.02 + heatVariation);
    
    // Side falling currents (stronger at edges)
    const sideCurrent = -distFromCenter * 0.01 * (1 - Math.pow(normalizedY - 0.5, 2));
    
    return centralCurrent + sideCurrent;
}

/**
 * Generate a blob object based on its lifecycle phase
 * @param {string} phase - Current blob phase 
 * @param {number} phaseProgress - Progress within the phase (0-1)
 * @param {number} containerLeft - Left edge of container
 * @param {number} containerRight - Right edge of container
 * @param {number} containerTop - Top edge of container
 * @param {number} containerBottom - Bottom edge of container
 * @param {number} containerWidth - Width of container
 * @param {number} minBlobSize - Minimum blob size
 * @param {number} maxBlobSize - Maximum blob size
 * @param {number} seed - Random seed value
 * @param {number} slowTime - Slowed time value
 * @returns {Object} Blob properties object
 */
export function generateBlobByPhase(phase, phaseProgress, containerLeft, containerRight, containerTop, containerBottom, containerWidth, minBlobSize, maxBlobSize, seed, slowTime) {
    let x, y, size, stretch, wobble, opacity;
    
    // Distinct behavior for each phase
    switch (phase) {
        case 'forming':
            // Form at the bottom, growing in size
            x = containerLeft + containerWidth * (0.3 + Math.sin(seed) * 0.4);
            y = containerBottom - containerWidth * 0.1;
            // Start small and grow
            size = minBlobSize + (maxBlobSize - minBlobSize) * phaseProgress;
            stretch = 0.8 + phaseProgress * 0.3; // Stretch upward as it forms
            wobble = 0.2 * phaseProgress; // Starts stable, begins to wobble
            opacity = 0.3 + phaseProgress * 0.7; // Fade in
            break;
            
        case 'rising':
            // Rise up with wobbling motion
            x = containerLeft + containerWidth * (0.3 + Math.sin(seed) * 0.4);
            x += Math.sin(slowTime * 0.3 + seed) * (10 * phaseProgress); // Wobble more as it rises
            // Move from bottom to top
            y = containerBottom - (containerBottom - containerTop) * 0.3 - 
                (containerBottom - containerTop) * 0.6 * phaseProgress;
            // Full size with slight pulsing
            size = maxBlobSize * (0.9 + Math.sin(slowTime * 0.5 + seed) * 0.1);
            // Stretch changes with movement - elongated while moving fast
            stretch = 1.2 - 0.4 * Math.sin(phaseProgress * Math.PI);
            wobble = 0.6; // Maximum wobble during rise
            opacity = 1.0; // Fully visible
            break;
            
        case 'ceiling':
            // Spread out against the ceiling
            const spreadCenter = containerLeft + containerWidth * (0.3 + Math.sin(seed) * 0.3);
            x = spreadCenter;
            y = containerTop + containerWidth * 0.12;
            // Spread and flatten against ceiling
            size = maxBlobSize * (1.1 + phaseProgress * 0.3);
            stretch = 0.5 - phaseProgress * 0.2; // Flatten horizontally
            wobble = 0.2; // Less wobble when compressed
            opacity = 1.0;
            break;
            
        case 'descending':
            // Fall down along the sides
            const side = Math.sign(Math.sin(seed)); // -1 or 1 for left/right side
            const sideDistance = 0.35 + Math.sin(seed * 3) * 0.1; // Vary the side distance
            x = containerLeft + containerWidth * (0.5 + side * sideDistance);
            x += Math.sin(slowTime * 0.2 + seed) * 5; // Slight wobble
            // Move from top to bottom
            y = containerTop + (containerBottom - containerTop) * 0.2 + 
                (containerBottom - containerTop) * 0.6 * phaseProgress;
            size = maxBlobSize * (0.8 + Math.sin(slowTime * 0.4 + seed) * 0.1);
            // Stretch changes with movement - elongated while moving fast
            stretch = 1.3 - 0.2 * Math.cos(phaseProgress * Math.PI);
            wobble = 0.3; // Moderate wobble during descent
            opacity = 0.9; // Slightly less visible
            break;
            
        case 'merging':
            // Move toward the center bottom for merging
            x = containerLeft + containerWidth * (0.5 + Math.sin(seed) * 0.2);
            y = containerBottom - containerWidth * 0.15;
            // Shrink as it prepares to merge with forming blob
            size = maxBlobSize * (0.8 - phaseProgress * 0.5);
            stretch = 0.7 + phaseProgress * 0.2; // Change shape during merge
            wobble = 0.1 + phaseProgress * 0.2; // Increase wobble as it merges
            opacity = 0.9 - phaseProgress * 0.6; // Fade out as it merges
            break;
            
        default:
            // Fallback
            x = containerLeft + containerWidth / 2;
            y = (containerBottom + containerTop) / 2;
            size = maxBlobSize;
            stretch = 1.0;
            wobble = 0.3;
            opacity = 1.0;
    }
    
    return { x, y, size, stretch, wobble, opacity };
}

/**
 * Calculate blob influence at a specific point
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate 
 * @param {Object} blob - Blob object
 * @param {number} slowTime - Slowed time value
 * @returns {Object} Influence data with distance and influence value
 */
export function calculateBlobInfluence(x, y, blob, slowTime) {
    // Apply wobble effect to position
    const wobbleX = blob.wobble * Math.sin(slowTime * 0.7 + blob.seed * 3) * blob.size * 0.3;
    const wobbleY = blob.wobble * Math.sin(slowTime * 0.5 + blob.seed * 5) * blob.size * 0.2;
    
    // Calculate distance to wobbling blob with stretch factor
    const dx = (x - (blob.x + wobbleX)) / blob.stretch;
    const dy = (y - (blob.y + wobbleY)) * blob.stretch;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Blob field strength with varied falloff based on phase
    let falloff = 0.8;
    if (blob.phase === 'ceiling') falloff = 0.5; // Sharper edges when compressed
    if (blob.phase === 'forming') falloff = 1.2; // Softer edges when forming
    
    // Calculate influence with proper falloff
    const blobField = Math.max(0, 1 - (distance / (blob.size * falloff)));
    // Use higher powers for sharper edges
    const influence = Math.pow(blobField, 3) * blob.opacity;
    
    return { distance, influence };
}
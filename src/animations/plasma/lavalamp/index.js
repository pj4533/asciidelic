/**
 * Main entry point for lava lamp animation component
 */
import { createBlobs } from './blobLifecycle.js';
import { calculateBlobInfluence } from './blobPhysics.js';
import { renderGlass, renderBubble, renderLava, renderBackground } from './renderer.js';

/**
 * Create a lava lamp animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function lavaLampAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const width = grid.width;
    const height = grid.height;
    
    // Ultra slow time for lava lamp effect (even slower for more realism)
    const slowTime = time * 0.15 * config.speed;
    
    // Lamp container parameters - create a container shape
    const containerWidth = width * 0.7; 
    const containerLeft = (width - containerWidth) / 2;
    const containerRight = containerLeft + containerWidth;
    const containerTop = height * 0.05;
    const containerBottom = height * 0.95;
    
    // Fluid dynamics parameters
    const heatVariation = Math.sin(slowTime * 0.3) * 0.01 + 0.01; // Simulates heating element
    
    // Blob simulation
    const maxBlobs = 8 + Math.floor(Math.sin(slowTime * 0.05) * 2);
    const minBlobSize = Math.min(width, height) * 0.08;
    const maxBlobSize = Math.min(width, height) * 0.22;
    
    // Create all blobs
    const blobs = createBlobs(
        maxBlobs, 
        slowTime, 
        containerLeft, 
        containerRight, 
        containerTop, 
        containerBottom, 
        containerWidth, 
        minBlobSize, 
        maxBlobSize,
        deltaTime
    );
    
    // Lamp body parameters - for creating the glass container look
    const glassThickness = 2; // Thickness of lamp container
    
    // Render the lamp
    grid.forEach((x, y, cell) => {
        // Check if in lamp container
        const inContainer = x >= containerLeft && x <= containerRight && 
                          y >= containerTop && y <= containerBottom;
        
        // Check if on glass edge
        const onGlassEdge = 
            (Math.abs(x - containerLeft) <= glassThickness || Math.abs(x - containerRight) <= glassThickness) ||
            (Math.abs(y - containerTop) <= glassThickness || Math.abs(y - containerBottom) <= glassThickness);
        
        // Check for cap
        const inCap = x >= containerLeft && x <= containerRight && 
                    ((y >= containerTop - 3 && y < containerTop) || 
                     (y > containerBottom && y <= containerBottom + 3));
        
        // Calculate blob influence at this point
        let nearestBlobDist = Infinity;
        let nearestBlobPhase = null;
        let totalInfluence = 0;
        let maxInfluence = 0;
        let blobHue = 0;
        let blobTemp = 0;
        
        // Find nearest blob and calculate total influence
        for (const blob of blobs) {
            const { distance, influence } = calculateBlobInfluence(x, y, blob, slowTime);
            
            // Track nearest blob
            if (distance < nearestBlobDist) {
                nearestBlobDist = distance;
                nearestBlobPhase = blob.phase;
                blobHue = blob.colorOffset;
                blobTemp = blob.blobTemperature;
            }
            
            totalInfluence += influence;
            maxInfluence = Math.max(maxInfluence, influence);
        }
        
        // Normalize to [0,1] range
        const normalizedValue = Math.min(1, totalInfluence);
        
        // Add flowing patterns inside the blobs
        const flowPattern = Math.sin((x * 0.2) + (y * 0.3) + slowTime * 0.2) * 0.5 + 0.5;
        const flowPattern2 = Math.cos((x * 0.3) - (y * 0.2) + slowTime * 0.15) * 0.5 + 0.5;
        
        // Combine influences with flow pattern
        const combinedPattern = normalizedValue * 0.7 + (flowPattern * flowPattern2 * normalizedValue) * 0.3;
        
        // Add bubble effects occasionally
        const bubbleProbability = normalizedValue * 0.15 * heatVariation * 10;
        const isBubble = inContainer && Math.random() < bubbleProbability && normalizedValue > 0.3;
        
        // Default - outside the lamp
        if (!inContainer && !inCap) {
            renderBackground(grid, x, y, false, time, colorManager);
            return;
        }
        
        // Glass container edges
        if (onGlassEdge || inCap) {
            renderGlass(grid, x, y, containerLeft, containerRight, containerTop, containerBottom, glassThickness, inCap, normalizedValue, time, colorManager);
            return;
        }
        
        // Inside the lamp - bubble
        if (isBubble) {
            renderBubble(grid, x, y, time, colorManager);
            return;
        }
        
        // Draw the lava/liquid
        if (normalizedValue > 0.05) {
            renderLava(grid, x, y, normalizedValue, combinedPattern, flowPattern, blobHue, time, colorManager);
            return;
        }
        
        // Default - empty space inside lamp
        renderBackground(grid, x, y, true, time, colorManager);
    });
}
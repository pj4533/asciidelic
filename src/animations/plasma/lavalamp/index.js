/**
 * Main entry point for lava lamp animation component
 */
import { createBlobSystem } from './blobLifecycle.js';
import { applyPhysics } from './blobPhysics.js';
import { renderPlasma } from './renderer.js';

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
    // Apply speed configuration to time and deltaTime
    // Adjusted range to spread over wider input scale (0-3 instead of 0-1)
    // At speed=0: effectiveSpeed = 0.2 (unchanged minimum)
    // At speed=3: effectiveSpeed = 0.62 (same as what speed=1 was previously)
    const effectiveSpeed = 0.2 + (config.speed * 0.14); // Same baseline with reduced multiplier
    const colorTime = time * 0.2; // Separate time value for colors - NOT affected by speed
    const slowTime = time * effectiveSpeed;
    const scaledDeltaTime = deltaTime * effectiveSpeed; // Scale deltaTime consistently
    
    // Generate or update blob system
    if (!grid.__blobSystem) {
        grid.__blobSystem = createBlobSystem();
        grid.__blobSystem.colorManager = colorManager; // Store a reference to the colorManager
    }
    
    const blobSystem = grid.__blobSystem;
    
    // Update colorManager reference in case it changed
    blobSystem.colorManager = colorManager;
    
    // Configure blob system based on density
    if (config.density !== undefined) {
        // Adjust max blobs based on density (between 5-20) - significantly reduced range
        const maxBlobs = Math.round(5 + (config.density * 15));
        if (blobSystem.maxBlobs !== maxBlobs) {
            blobSystem.maxBlobs = maxBlobs;
        }
        
        // Adjust spawn interval inversely with density (1.2-0.6 seconds) - longer intervals
        blobSystem.spawnInterval = Math.max(0.6, 1.2 - (config.density * 0.6));
    }
    
    // Update blob physics and lifecycle with scaled time values
    // Pass both time values - slowTime for motion, colorTime for color effects
    applyPhysics(blobSystem, slowTime, scaledDeltaTime, colorTime);
    
    // Render the plasma effect - use colorTime for consistent colors regardless of speed
    renderPlasma(grid, colorTime, blobSystem, characters, colorManager);
}

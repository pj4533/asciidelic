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
    // Use a much lower scaling factor for slower, more fluid-like behavior
    // The range is now much narrower to keep lava lamp slow and gentle
    const effectiveSpeed = 0.05 + (config.speed * 0.1); // Scale for slower motion with narrow range
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
        // Adjust max blobs based on density (between 15-30)
        const maxBlobs = Math.round(15 + (config.density * 15));
        if (blobSystem.maxBlobs !== maxBlobs) {
            blobSystem.maxBlobs = maxBlobs;
        }
        
        // Adjust spawn interval inversely with density (0.8-0.3 seconds)
        blobSystem.spawnInterval = Math.max(0.3, 0.8 - (config.density * 0.5));
    }
    
    // Update blob physics and lifecycle with scaled time values
    // Pass both time values - slowTime for motion, colorTime for color effects
    applyPhysics(blobSystem, slowTime, scaledDeltaTime, colorTime);
    
    // Render the plasma effect - use colorTime for consistent colors regardless of speed
    renderPlasma(grid, colorTime, blobSystem, characters, colorManager);
}

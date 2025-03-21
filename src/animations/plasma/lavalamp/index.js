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
    // Slower time for more fluid-like behavior
    const slowTime = time * 0.2 * config.speed;
    
    // Generate or update blob system
    if (!grid.__blobSystem) {
        grid.__blobSystem = createBlobSystem();
    }
    
    const blobSystem = grid.__blobSystem;
    
    // Update blob physics and lifecycle
    applyPhysics(blobSystem, slowTime, deltaTime);
    
    // Render the plasma effect
    renderPlasma(grid, slowTime, blobSystem, characters, colorManager);
}

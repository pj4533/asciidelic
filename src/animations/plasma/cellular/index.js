/**
 * Cellular Animation - Dynamic cell-like structures that grow, evolve, and interact
 */
import { random, oscillate, lerp, smootherStep, distance } from '../../../utils/math.js';
import { createCellSystem, updateCellSystem, evolveCellSystem } from './cellSystem.js';
import { renderCells } from './cellRenderer.js';

/**
 * Create a cellular animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function cellularAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const width = grid.width;
    const height = grid.height;
    
    // Initialize or update cell system
    if (!grid.__cellSystem) {
        grid.__cellSystem = createCellSystem();
    }
    
    // Apply configuration settings
    const cellSystem = grid.__cellSystem;
    updateCellSystem(cellSystem, time, deltaTime, config);
    
    // Apply system time
    const scaledSpeed = config.speed * 0.3;
    const slowTime = time * scaledSpeed;
    
    // Render the cells
    renderCells(grid, cellSystem, time, slowTime, config, colorManager);
    
    // Update cell system for next frame
    evolveCellSystem(cellSystem, time, slowTime, deltaTime);
}
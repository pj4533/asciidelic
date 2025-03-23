/**
 * Cell Events - Special events for cell interactions
 */
import { random } from '../../../utils/math.js';

/**
 * Burst a random cell
 * @param {Object} system - The cell system 
 */
export function burstRandomCell(system) {
    // Find active mature cells
    const matureCells = system.cells.filter(c => 
        c.active && !c.isGrowing && c.energy > 0.5);
    
    if (matureCells.length === 0) return;
    
    // Select a random cell
    const cell = matureCells[Math.floor(random(0, matureCells.length))];
    
    // Burst effect - rapid shrinkage followed by deactivation
    cell.targetRadius *= 0.5;
    cell.energy *= 0.3;
    
    // Schedule cell death
    cell.age = 0.8;
}

/**
 * Accelerate a random cell
 * @param {Object} system - The cell system
 */
export function accelerateRandomCell(system) {
    // Find active cells
    const activeCells = system.cells.filter(c => c.active);
    
    if (activeCells.length === 0) return;
    
    // Select a random cell
    const cell = activeCells[Math.floor(random(0, activeCells.length))];
    
    // Apply random acceleration
    cell.vx += random(-0.01, 0.01);
    cell.vy += random(-0.01, 0.01);
    
    // Add energy
    cell.energy = Math.min(1, cell.energy + 0.2);
}

/**
 * Energize all cells
 * @param {Object} system - The cell system
 */
export function energizeCells(system) {
    // Find active cells
    const activeCells = system.cells.filter(c => c.active);
    
    // Apply energy boost to all cells
    activeCells.forEach(cell => {
        // Energy boost
        cell.energy = Math.min(1, cell.energy + 0.15);
        
        // Growth boost for growing cells
        if (cell.isGrowing) {
            cell.growthRate *= 1.2;
        }
    });
}
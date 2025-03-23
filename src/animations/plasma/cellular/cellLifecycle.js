/**
 * Cell Lifecycle - Functions for cell growth, movement, and lifecycle
 */
import { lerp } from '../../../utils/math.js';

/**
 * Update an individual cell
 * @param {Object} cell - The cell to update
 * @param {number} time - Current time
 * @param {number} slowTime - Scaled time
 * @param {number} deltaTime - Delta time
 */
export function updateCell(cell, time, slowTime, deltaTime) {
    if (!cell.active) return;
    
    // Update age
    cell.age += deltaTime / cell.lifespan;
    
    // Clear field points
    cell.fieldPoints.clear();
    
    // Cell lifecycle
    if (cell.age >= 1) {
        // Cell death
        cell.active = false;
        return;
    }
    
    // Movement - cells drift slowly with some oscillation
    const oscX = Math.sin(slowTime * 0.3 + cell.id * 7) * 0.0005;
    const oscY = Math.cos(slowTime * 0.4 + cell.id * 5) * 0.0005;
    
    // Apply velocity and boundaries
    cell.x += (cell.vx + oscX) * deltaTime;
    cell.y += (cell.vy + oscY) * deltaTime;
    
    // Keep within bounds with a bounce effect
    if (cell.x < 0.1 || cell.x > 0.9) {
        cell.vx = -cell.vx * 0.8;
        cell.x = cell.x < 0.1 ? 0.1 : 0.9;
    }
    if (cell.y < 0.1 || cell.y > 0.9) {
        cell.vy = -cell.vy * 0.8;
        cell.y = cell.y < 0.1 ? 0.1 : 0.9;
    }
    
    // Apply drag
    cell.vx *= 0.99;
    cell.vy *= 0.99;
    
    // Growth and division
    if (cell.isGrowing) {
        // Cell growth
        cell.radius = lerp(cell.radius, cell.targetRadius, cell.growthRate);
        
        // Check for division
        if (time - cell.birthTime > cell.divideTime && cell.energy > 0.7) {
            divideCell(cell);
        }
    } 
    // Mature cell
    else {
        // Pulsation effect
        const pulseFactor = 0.05 * Math.sin(slowTime * 2 + cell.id * 3);
        cell.radius = cell.targetRadius * (1 + pulseFactor);
        
        // Consume energy over time
        cell.energy -= cell.metabolismRate * deltaTime;
    }
}

/**
 * Cell division
 * @param {Object} parent - The parent cell
 */
export function divideCell(parent) {
    // Stop parent growth
    parent.isGrowing = false;
    
    // Energy is consumed in division
    parent.energy *= 0.7;
    
    // Child cells will be created by spawn function
}
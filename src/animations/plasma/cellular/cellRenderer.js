/**
 * Cell Renderer - Renders cells to the character grid
 */
import { oscillate, lerp } from '../../../utils/math.js';

/**
 * Render all cells to the grid
 * @param {Object} grid - Character grid
 * @param {Object} cellSystem - Cell system
 * @param {number} time - Current time
 * @param {number} slowTime - Scaled time
 * @param {Object} config - Configuration
 * @param {Object} colorManager - Color manager
 */
export function renderCells(grid, cellSystem, time, slowTime, config, colorManager) {
    // Cell membrane characters
    const membraneChars = [
        '◌', '◯', '⦾', '⦿', '◍', '◎', '◙', '◔', '◕', '◖', '◗', '◴', '◵', '◶', '◷'
    ];
    
    // Organelle characters
    const organelleChars = [
        '✺', '✹', '✸', '✷', '✶', '✵', '✴', '✳', '✲', '✱', 
        '✽', '✾', '✿', '❀', '❁', '❃', '❇', '❈', '❉', '❊', '❋'
    ];
    
    // Select organic/circular characters with more variety
    const cellChars = [
        '○', '◎', '●', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◍', '◉',
        '⊙', '⊚', '⊛', '❀', '❁', '❂', '☘', '♧', '♣', '♠', '✧', '✦', 
        '⚬', '⚭', '⚮', '◌', '◯', '⟡', '⦿', '⨀', '⬤'
    ];

    // Render the cells
    grid.forEach((x, y, cell) => {
        // Calculate cell influences
        let closestCellDist = Infinity;
        let closestCell = null;
        let totalInfluence = 0;
        let secondClosestDist = Infinity;
        
        // Calculate influence from all cells
        const width = grid.width;
        const height = grid.height;
        
        // Calculate cell field from all cells
        for (const cell of cellSystem.cells) {
            // Skip inactive cells
            if (!cell.active) continue;
            
            // Calculate cell influence
            const dx = x - cell.x * width;
            const dy = y - cell.y * height;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Track closest cells
            if (dist < closestCellDist) {
                secondClosestDist = closestCellDist;
                closestCellDist = dist;
                closestCell = cell;
            } else if (dist < secondClosestDist) {
                secondClosestDist = dist;
            }
            
            // Calculate influence with sharper edges based on cell state
            const radius = cell.radius * Math.min(width, height) * (0.9 + 0.1 * Math.sin(slowTime * 1.2 + cell.id));
            const normalizedDist = dist / radius;
            
            // Skip if too far
            if (normalizedDist > 1.2) continue;
            
            // Calculate influence with more dramatic falloff at edges
            const falloff = cell.isGrowing ? 
                Math.max(0, 1 - Math.pow(normalizedDist, cell.growthRate * 3)) : 
                Math.max(0, 1 - Math.pow(normalizedDist, 1.5 + cell.age * 0.5));
                
            // Age factor for cell maturity effects
            const ageFactor = cell.isGrowing ? 
                Math.min(1, cell.age * 2) : 
                Math.max(0, 1 - (cell.age - 0.6) * 3);
            
            // Apply pulsation effect
            const pulse = 1 + 0.1 * Math.sin(slowTime * 2 + cell.id * 10);
            
            // Calculate total influence
            const influence = falloff * ageFactor * pulse * cell.energy;
            totalInfluence += influence;
            
            // Store cell-specific data for this point
            if (!cell.fieldPoints) cell.fieldPoints = new Map();
            cell.fieldPoints.set(`${x},${y}`, { 
                dist: normalizedDist, 
                influence 
            });
        }
        
        // No cells influencing this point
        if (totalInfluence <= 0 || !closestCell) {
            // Empty space character
            grid.setCell(x, y, {
                character: ' ',
                hue: 0,
                saturation: 0,
                lightness: 0
            });
            return;
        }
        
        // Normalize influence
        totalInfluence = Math.min(1, totalInfluence);
        
        renderCellPoint(x, y, grid, closestCell, closestCellDist, secondClosestDist, totalInfluence, 
            slowTime, cellChars, membraneChars, organelleChars, config, colorManager, time);
    });
}

/**
 * Calculate influence of all cells on a grid point
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} cellSystem - Cell system
 * @param {Object} grid - Character grid
 * @param {number} slowTime - Scaled time
 * @param {number} closestCellDist - Output parameter for closest cell distance
 * @param {Object} closestCell - Output parameter for closest cell
 * @param {number} secondClosestDist - Output parameter for second closest distance
 * @param {number} totalInfluence - Output parameter for total influence
 */
function calculateCellInfluence(x, y, cellSystem, grid, slowTime, closestCellDist, closestCell, secondClosestDist, totalInfluence) {
    const width = grid.width;
    const height = grid.height;
    
    // Calculate cell field from all cells
    for (const cell of cellSystem.cells) {
        // Skip inactive cells
        if (!cell.active) continue;
        
        // Calculate cell influence
        const dx = x - cell.x * width;
        const dy = y - cell.y * height;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Track closest cells
        if (dist < closestCellDist) {
            secondClosestDist = closestCellDist;
            closestCellDist = dist;
            closestCell = cell;
        } else if (dist < secondClosestDist) {
            secondClosestDist = dist;
        }
        
        // Calculate influence with sharper edges based on cell state
        const radius = cell.radius * Math.min(width, height) * (0.9 + 0.1 * Math.sin(slowTime * 1.2 + cell.id));
        const normalizedDist = dist / radius;
        
        // Skip if too far
        if (normalizedDist > 1.2) continue;
        
        // Calculate influence with more dramatic falloff at edges
        const falloff = cell.isGrowing ? 
            Math.max(0, 1 - Math.pow(normalizedDist, cell.growthRate * 3)) : 
            Math.max(0, 1 - Math.pow(normalizedDist, 1.5 + cell.age * 0.5));
            
        // Age factor for cell maturity effects
        const ageFactor = cell.isGrowing ? 
            Math.min(1, cell.age * 2) : 
            Math.max(0, 1 - (cell.age - 0.6) * 3);
        
        // Apply pulsation effect
        const pulse = 1 + 0.1 * Math.sin(slowTime * 2 + cell.id * 10);
        
        // Calculate total influence
        const influence = falloff * ageFactor * pulse * cell.energy;
        totalInfluence += influence;
        
        // Store cell-specific data for this point
        if (!cell.fieldPoints) cell.fieldPoints = new Map();
        cell.fieldPoints.set(`${x},${y}`, { 
            dist: normalizedDist, 
            influence 
        });
    }
}

/**
 * Render a specific cell point
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} grid - Character grid
 * @param {Object} closestCell - Closest cell
 * @param {number} closestCellDist - Closest cell distance
 * @param {number} secondClosestDist - Second closest cell distance
 * @param {number} totalInfluence - Total cell influence
 * @param {number} slowTime - Scaled time
 * @param {Array} cellChars - Cell characters
 * @param {Array} membraneChars - Membrane characters
 * @param {Array} organelleChars - Organelle characters
 * @param {Object} config - Configuration
 * @param {Object} colorManager - Color manager
 * @param {number} time - Current time
 */
function renderCellPoint(x, y, grid, closestCell, closestCellDist, secondClosestDist, totalInfluence, 
                        slowTime, cellChars, membraneChars, organelleChars, config, colorManager, time) {
    // Determine if point is on a membrane, in cytoplasm, or an organelle
    const point = closestCell.fieldPoints.get(`${x},${y}`);
    const normalizedDist = point ? point.dist : 1;
    
    // Determine cell region and visualization
    let charSet, region, lightnessBase, saturationMod;
    
    // Membrane effect - stronger at the edges
    if (normalizedDist > 0.85 && normalizedDist < 1.05) {
        // Cell membrane
        region = 'membrane';
        charSet = membraneChars;
        lightnessBase = 65;
        saturationMod = 1.0;
        
        // Membrane animation - more activity at the boundary
        const membraneActivity = Math.sin(slowTime * 3 + closestCell.id * 5 + x * 0.1 + y * 0.1) * 0.5 + 0.5;
        
        // Create cell membrane pattern
        const membranePattern = (normalizedDist > 0.95) ? 
            0.7 + membraneActivity * 0.3 : 
            0.3 + membraneActivity * 0.7;
            
        totalInfluence *= membranePattern;
    }
    // Organelle region - inner structures that appear based on cell state
    else if (normalizedDist < 0.4 && closestCell.energy > 0.7 && Math.random() < 0.3) {
        region = 'organelle';
        charSet = organelleChars;
        lightnessBase = 70;
        saturationMod = 1.2;
        
        // Organelle size and distribution varies with cell state
        const organelleActivity = oscillate(slowTime * 2 + closestCell.id * 3, 1.5);
        totalInfluence = 0.4 + organelleActivity * 0.6;
    } 
    // Cytoplasm - inner cell region
    else if (normalizedDist < 0.85) {
        region = 'cytoplasm';
        charSet = cellChars;
        lightnessBase = 50;
        saturationMod = 0.8;
        
        // Cytoplasm activity - flowing patterns inside the cell
        const cytoX = Math.sin(x * 0.1 + slowTime * 0.5 + closestCell.id) * 0.5 + 0.5;
        const cytoY = Math.cos(y * 0.1 + slowTime * 0.7 + closestCell.id) * 0.5 + 0.5;
        const cytoPattern = (cytoX * 0.6 + cytoY * 0.4) * totalInfluence;
        
        totalInfluence = cytoPattern;
    } 
    // Extracellular region - outside but still influenced
    else {
        region = 'exterior';
        charSet = cellChars.slice(0, 10); // Fewer characters for exterior
        lightnessBase = 40;
        saturationMod = 0.6;
        
        // Exterior influence drops off more quickly
        totalInfluence *= 0.5;
    }
    
    // Density affects character selection
    const densityFactor = config.density * 0.9 + 0.1;
    const charIndex = Math.floor(totalInfluence * charSet.length * densityFactor);
    const safeIndex = Math.min(Math.max(0, charIndex), charSet.length - 1);
    
    // Calculate cell interaction effects
    const interactionFactor = 1 - Math.min(1, secondClosestDist / closestCellDist);
    
    // Cell-specific coloring
    let hue = closestCell.hue;
    
    // Interaction zones blend colors between cells
    if (region === 'exterior' && interactionFactor > 0.2) {
        // Blend hues at cell boundaries
        const interactionHue = (hue + 40) % 360;
        hue = lerp(hue, interactionHue, interactionFactor);
    }
    
    // Time-based oscillation for cell activity
    const activity = 0.6 + 0.4 * Math.sin(slowTime * 1.5 + closestCell.id * 7);
    
    // Apply oscillating lightness based on cell activity and region
    let lightness = lightnessBase;
    
    // Membrane pulses with cell activity
    if (region === 'membrane') {
        lightness += 15 * activity * totalInfluence;
    } 
    // Organelles have their own rhythm
    else if (region === 'organelle') {
        lightness += 20 * oscillate(slowTime * 3 + closestCell.id * 11, 2) * totalInfluence;
    }
    // Cytoplasm flows with gentler oscillation
    else if (region === 'cytoplasm') {
        lightness += 10 * activity * totalInfluence;
    }
    
    // Set cell in grid
    grid.setCell(x, y, {
        character: charSet[safeIndex],
        hue: (hue + colorManager.getHue(x, y, normalizedDist, totalInfluence, time)) % 360,
        saturation: colorManager.saturation * saturationMod,
        lightness
    });
}
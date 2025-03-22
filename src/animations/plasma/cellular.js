/**
 * Cellular Animation - Dynamic cell-like structures that grow, evolve, and interact
 */
import { random, oscillate, lerp, smootherStep, distance } from '../../utils/math.js';

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
    
    // Select organic/circular characters with more variety
    const cellChars = [
        '○', '◎', '●', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◍', '◉',
        '⊙', '⊚', '⊛', '❀', '❁', '❂', '☘', '♧', '♣', '♠', '✧', '✦', 
        '⚬', '⚭', '⚮', '◌', '◯', '⟡', '⦿', '⨀', '⬤'
    ];
    
    // Cell membrane characters
    const membraneChars = [
        '◌', '◯', '⦾', '⦿', '◍', '◎', '◙', '◔', '◕', '◖', '◗', '◴', '◵', '◶', '◷'
    ];
    
    // Organelle characters
    const organelleChars = [
        '✺', '✹', '✸', '✷', '✶', '✵', '✴', '✳', '✲', '✱', 
        '✽', '✾', '✿', '❀', '❁', '❃', '❇', '❈', '❉', '❊', '❋'
    ];
    
    // Render the cells
    grid.forEach((x, y, cell) => {
        // Calculate cell influences
        let closestCellDist = Infinity;
        let closestCell = null;
        let totalInfluence = 0;
        let secondClosestDist = Infinity;
        
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
    });
    
    // Update cell system for next frame
    evolveCellSystem(cellSystem, time, slowTime, deltaTime);
}

/**
 * Create the cell system
 * @returns {Object} Cell system object
 */
function createCellSystem() {
    return {
        cells: [],
        nextCellId: 0,
        maxCells: 8,
        lastSpawnTime: 0,
        spawnInterval: 2,
        nextEventTime: 0
    };
}

/**
 * Update the cell system based on configuration
 * @param {Object} system - The cell system
 * @param {number} time - Current time
 * @param {number} deltaTime - Delta time
 * @param {Object} config - Configuration 
 */
function updateCellSystem(system, time, deltaTime, config) {
    // Update max cells based on density
    system.maxCells = Math.floor(4 + config.density * 8);
    
    // Update spawn interval inversely with speed
    system.spawnInterval = Math.max(1, 3 - config.speed * 2);
    
    // Update existing cells
    system.cells.forEach(cell => {
        // Update cell color based on configuration
        cell.hue = (cell.hueOffset + config.baseHue) % 360;
    });
}

/**
 * Evolve the cell system over time
 * @param {Object} system - The cell system
 * @param {number} time - Current time
 * @param {number} slowTime - Scaled time
 * @param {number} deltaTime - Delta time
 */
function evolveCellSystem(system, time, slowTime, deltaTime) {
    // Handle cell spawning
    if (time - system.lastSpawnTime > system.spawnInterval) {
        // Try to spawn a new cell if under max
        if (system.cells.filter(c => c.active).length < system.maxCells) {
            spawnCell(system, time, slowTime);
        }
        system.lastSpawnTime = time;
    }
    
    // Random events
    if (time > system.nextEventTime) {
        triggerCellEvent(system, time, slowTime);
        // Set next event time (every 3-8 seconds)
        system.nextEventTime = time + random(3, 8);
    }
    
    // Update all cells
    system.cells.forEach(cell => {
        updateCell(cell, time, slowTime, deltaTime);
    });
    
    // Clean up dead cells periodically
    if (system.cells.length > system.maxCells * 2) {
        system.cells = system.cells.filter(cell => cell.active);
    }
}

/**
 * Spawn a new cell
 * @param {Object} system - The cell system
 * @param {number} time - Current time
 * @param {number} slowTime - Scaled time
 */
function spawnCell(system, time, slowTime) {
    // Create a new cell with random properties
    const cell = {
        id: system.nextCellId++,
        x: random(0.15, 0.85), // Position (0-1 range)
        y: random(0.15, 0.85),
        vx: random(-0.002, 0.002), // Velocity
        vy: random(-0.002, 0.002),
        radius: random(0.08, 0.15), // Size
        targetRadius: random(0.1, 0.2),
        energy: random(0.7, 1.0),
        age: 0,
        lifespan: random(10, 20),
        hueOffset: random(0, 120),
        isGrowing: true,
        growthRate: random(0.01, 0.03),
        divideTime: random(8, 12),
        metabolismRate: random(0.005, 0.01),
        fieldPoints: new Map(),
        active: true,
        birthTime: time
    };
    
    // Add to system
    system.cells.push(cell);
}

/**
 * Update an individual cell
 * @param {Object} cell - The cell to update
 * @param {number} time - Current time
 * @param {number} slowTime - Scaled time
 * @param {number} deltaTime - Delta time
 */
function updateCell(cell, time, slowTime, deltaTime) {
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
function divideCell(parent) {
    // Stop parent growth
    parent.isGrowing = false;
    
    // Energy is consumed in division
    parent.energy *= 0.7;
    
    // Child cells will be created by spawn function
}

/**
 * Trigger random cell events
 * @param {Object} system - The cell system
 * @param {number} time - Current time
 * @param {number} slowTime - Scaled time
 */
function triggerCellEvent(system, time, slowTime) {
    // Only proceed if we have cells
    if (system.cells.length === 0) return;
    
    // Choose a random event
    const eventType = Math.floor(random(0, 3));
    
    switch(eventType) {
        case 0: // Cell burst
            burstRandomCell(system);
            break;
        case 1: // Cell acceleration
            accelerateRandomCell(system);
            break;
        case 2: // Energy pulse
            energizeCells(system);
            break;
    }
}

/**
 * Burst a random cell
 * @param {Object} system - The cell system 
 */
function burstRandomCell(system) {
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
function accelerateRandomCell(system) {
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
function energizeCells(system) {
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
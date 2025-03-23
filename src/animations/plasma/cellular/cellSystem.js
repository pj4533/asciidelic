/**
 * Cell System - Creates and manages cell systems
 */
import { random } from '../../../utils/math.js';
import { updateCell, divideCell } from './cellLifecycle.js';
import { burstRandomCell, accelerateRandomCell, energizeCells } from './cellEvents.js';

/**
 * Create the cell system
 * @returns {Object} Cell system object
 */
export function createCellSystem() {
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
export function updateCellSystem(system, time, deltaTime, config) {
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
export function evolveCellSystem(system, time, slowTime, deltaTime) {
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
export function spawnCell(system, time, slowTime) {
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
 * Trigger random cell events
 * @param {Object} system - The cell system
 * @param {number} time - Current time
 * @param {number} slowTime - Scaled time
 */
export function triggerCellEvent(system, time, slowTime) {
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
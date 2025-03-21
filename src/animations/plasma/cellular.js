/**
 * Cellular Animation - Organic cell-like structures that grow and evolve
 */

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
    
    // Very slow time progression for organic feel
    const slowTime = time * 0.15 * config.speed;
    
    // Select organic/circular characters
    const cellChars = [
        '○', '◎', '●', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◍', '◉',
        '⊙', '⊚', '⊛', '❀', '❁', '❂', '☘', '♧', '♣', '♠'
    ];
    
    // Cell parameters (update over time)
    const numCells = 5 + Math.floor(Math.sin(slowTime * 0.2) * 3 + 3); // 2-8 cells
    const cellCenters = [];
    
    // Generate cell centers with slow movement
    for (let i = 0; i < numCells; i++) {
        // Each cell has its own movement pattern
        const seedX = i * 137.5 + 33.3;
        const seedY = i * 239.7 + 47.2;
        
        // Organic movement using sine waves with different frequencies
        const rx = Math.sin(slowTime * 0.2 + seedX) * 0.4 + Math.sin(slowTime * 0.11 + seedX * 2) * 0.2;
        const ry = Math.cos(slowTime * 0.17 + seedY) * 0.4 + Math.cos(slowTime * 0.13 + seedY * 2) * 0.2;
        
        // Position cells across the grid
        const x = width * (0.2 + rx * 0.3 + 0.6 * ((i % 3) / 2));
        const y = height * (0.2 + ry * 0.3 + 0.6 * (Math.floor(i / 3) / 2));
        
        // Cell radius changes over time (pulsating)
        const baseRadius = Math.min(width, height) * (0.1 + Math.sin(slowTime * 0.3 + i) * 0.05);
        
        cellCenters.push({
            x, 
            y, 
            radius: baseRadius,
            seed: i // Use for cell-specific variations
        });
    }
    
    grid.forEach((x, y, cell) => {
        // Calculate cell influence at this point
        let closestCell = null;
        let minDistance = Infinity;
        let cellValue = 0;
        
        for (const cell of cellCenters) {
            const dx = x - cell.x;
            const dy = y - cell.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Find closest cell
            if (distance < minDistance) {
                minDistance = distance;
                closestCell = cell;
            }
            
            // Calculate cell field (stronger near center)
            const cellField = Math.max(0, 1 - distance / (cell.radius * 2));
            cellValue += cellField * cellField; // Square for sharper edges
        }
        
        // Normalize to [0,1] range, clamp at 1
        const normalizedValue = Math.min(1, cellValue);
        
        // Cell wall effect (stronger at the edges)
        let isCellWall = false;
        if (closestCell) {
            const dx = x - closestCell.x;
            const dy = y - closestCell.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Create cell wall around the radius with small variance
            const wallThickness = 0.2;
            const innerEdge = closestCell.radius * (0.9 - wallThickness/2);
            const outerEdge = closestCell.radius * (0.9 + wallThickness/2);
            
            if (distance > innerEdge && distance < outerEdge) {
                isCellWall = true;
            }
        }
        
        // Character selection
        let charIndex;
        
        if (isCellWall) {
            // Cell wall characters (thicker, denser)
            charIndex = Math.floor(cellChars.length * 0.7 + normalizedValue * cellChars.length * 0.3 * config.density);
        } else if (normalizedValue > 0.5) {
            // Cell interior characters (medium density)
            charIndex = Math.floor(normalizedValue * cellChars.length * 0.6 * config.density);
        } else {
            // Intercellular space characters (sparse)
            charIndex = Math.floor(normalizedValue * 5 * config.density);
        }
        
        const safeIndex = Math.min(Math.max(0, charIndex), cellChars.length - 1);
        
        // Calculate hue based on position and cell influence
        const hue = colorManager.getHue(x, y, minDistance, normalizedValue, time);
        
        // Use saturation from color manager for consistency
        const saturation = colorManager.saturation;
        
        // Cell walls are brighter, intercellular space is darker
        let lightness;
        if (isCellWall) {
            lightness = 60 + normalizedValue * 20; // Bright walls
        } else if (normalizedValue > 0.5) {
            lightness = 40 + normalizedValue * 20; // Medium cell interior
        } else {
            lightness = 30 + normalizedValue * 20; // Dark intercellular space
        }
        
        grid.setCell(x, y, {
            character: cellChars[safeIndex],
            hue,
            saturation: colorManager.saturation,
            lightness
        });
    });
}
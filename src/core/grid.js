/**
 * Grid.js - Manages the character grid used for animations
 */
export class CharacterGrid {
    /**
     * Create a new character grid
     * @param {number} width - Width of the grid
     * @param {number} height - Height of the grid
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.initGrid();
    }

    /**
     * Initialize the grid with empty cells
     * @param {Object} defaultCell - Default properties for each cell
     */
    initGrid(defaultCell = { character: ' ', hue: 0, saturation: 0, lightness: 0 }) {
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push({ ...defaultCell });
            }
            this.grid.push(row);
        }
    }

    /**
     * Resize the grid
     * @param {number} newWidth - New width
     * @param {number} newHeight - New height
     */
    resize(newWidth, newHeight) {
        const oldGrid = this.grid;
        this.width = newWidth;
        this.height = newHeight;
        
        // Initialize a new grid with the new dimensions
        this.initGrid();
        
        // Copy over the old values where possible
        const minHeight = Math.min(oldGrid.length, this.height);
        for (let y = 0; y < minHeight; y++) {
            const minWidth = Math.min(oldGrid[y].length, this.width);
            for (let x = 0; x < minWidth; x++) {
                this.grid[y][x] = { ...oldGrid[y][x] };
            }
        }
    }

    /**
     * Get a cell at specific coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Object} The cell at the specified coordinates
     */
    getCell(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.grid[y][x];
        }
        return null;
    }

    /**
     * Set a cell at specific coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} cell - Cell properties
     */
    setCell(x, y, cell) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = { ...cell };
        }
    }

    /**
     * Update a cell at specific coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Object} properties - Properties to update
     */
    updateCell(x, y, properties) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            const cell = this.grid[y][x];
            this.grid[y][x] = { ...cell, ...properties };
        }
    }

    /**
     * Clear the grid (set all cells to a default value)
     * @param {Object} defaultCell - Default cell value
     */
    clear(defaultCell = { character: ' ', hue: 0, saturation: 0, lightness: 0 }) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = { ...defaultCell };
            }
        }
    }

    /**
     * Apply a function to each cell in the grid
     * @param {Function} fn - Function to apply (receives x, y, cell)
     */
    forEach(fn) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                fn(x, y, this.grid[y][x]);
            }
        }
    }
}
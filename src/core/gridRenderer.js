/**
 * Grid Renderer - Renders character grid to HTML
 */

export class GridRenderer {
    /**
     * Create a grid renderer
     * @param {HTMLElement} container - Container element to render into
     */
    constructor(container) {
        this.container = container;
    }
    
    /**
     * Render the grid to ASCII art
     * @param {Object} grid - The character grid to render
     */
    render(grid) {
        let output = '';
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const cell = grid.getCell(x, y);
                if (cell.character === ' ') {
                    output += ' ';
                } else {
                    output += `<span style="color: hsl(${cell.hue}, ${cell.saturation}%, ${cell.lightness}%)">${cell.character}</span>`;
                }
            }
            output += '\n';
        }
        this.container.innerHTML = output;
    }
}
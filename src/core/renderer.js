/**
 * Renderer.js - Renders the character grid to the DOM
 */
export class Renderer {
    /**
     * Create a new renderer
     * @param {HTMLElement} container - The container element to render into
     */
    constructor(container) {
        this.container = container;
        this.renderMode = 'html'; // Other potential modes: 'canvas', 'webgl'
    }

    /**
     * Set the container element
     * @param {HTMLElement} container - New container element
     */
    setContainer(container) {
        this.container = container;
    }

    /**
     * Set the rendering mode
     * @param {string} mode - Rendering mode ('html', 'canvas', etc.)
     */
    setRenderMode(mode) {
        if (['html', 'canvas', 'webgl'].includes(mode)) {
            this.renderMode = mode;
        } else {
            console.warn(`Unsupported render mode: ${mode}`);
        }
    }

    /**
     * Render the grid to the container
     * @param {CharacterGrid} grid - The grid to render
     */
    render(grid) {
        switch (this.renderMode) {
            case 'html':
                this.renderHtml(grid);
                break;
            case 'canvas':
                this.renderCanvas(grid);
                break;
            case 'webgl':
                this.renderWebGL(grid);
                break;
            default:
                this.renderHtml(grid);
                break;
        }
    }

    /**
     * Render the grid using HTML
     * @param {CharacterGrid} grid - The grid to render
     */
    renderHtml(grid) {
        let output = '';
        
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const cell = grid.getCell(x, y);
                if (cell) {
                    if (cell.character === ' ') {
                        output += ' ';
                    } else {
                        output += `<span style="color: hsl(${cell.hue}, ${cell.saturation}%, ${cell.lightness}%)">${cell.character}</span>`;
                    }
                }
            }
            output += '\n';
        }
        
        this.container.innerHTML = output;
    }

    /**
     * Render the grid using Canvas (placeholder for future implementation)
     * @param {CharacterGrid} grid - The grid to render
     */
    renderCanvas(grid) {
        console.warn('Canvas rendering not yet implemented');
        this.renderHtml(grid);
    }

    /**
     * Render the grid using WebGL (placeholder for future implementation)
     * @param {CharacterGrid} grid - The grid to render
     */
    renderWebGL(grid) {
        console.warn('WebGL rendering not yet implemented');
        this.renderHtml(grid);
    }
}
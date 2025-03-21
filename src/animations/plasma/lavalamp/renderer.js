/**
 * Renderer for lava lamp animation
 */
import { calculateBlobInfluence } from './blobPhysics.js';

// Character sets for different parts of the lava lamp
const bgChars = [' ', '.', '·', ':', '·'];
const glassChars = ['│', '║', '┃', '┆', '┇', '┊', '┋', '╎', '╏', '┴', '┬', '╷', '╶', '╴']; // Vertical borders
const lavaChars = [
    // Core blob characters (dense, rounded)
    '●', '◎', '◉', '⦿', '◍', '◌', '◯', '⚪', '⚫',
    // Medium density chars
    '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◴', '◵', '◶', '◷',
    // Lowest density/edge chars
    '○', '◌', '◯', '◠', '◡', '◜', '◝', '◞', '◟', '◚', '◛'
];
const bubbleChars = ['°', '•', '∘', '∙', '⊙', '⊚', '◦', '⊖', '⊗', '⊘', '⦂'];

/**
 * Render a glass container edge
 * @param {Object} grid - Character grid 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} containerLeft - Left edge of container
 * @param {number} containerRight - Right edge of container
 * @param {number} containerTop - Top edge of container
 * @param {number} containerBottom - Bottom edge of container
 * @param {number} glassThickness - Thickness of glass
 * @param {boolean} inCap - Whether position is in cap
 * @param {number} normalizedValue - Blob influence value (0-1)
 * @param {number} time - Current time in seconds
 * @param {Object} colorManager - Color manager
 */
export function renderGlass(grid, x, y, containerLeft, containerRight, containerTop, containerBottom, glassThickness, inCap, normalizedValue, time, colorManager) {
    // Choose appropriate glass character based on position
    let glassChar;
    
    if (Math.abs(x - containerLeft) <= glassThickness) {
        // Left edge
        glassChar = glassChars[0];
    } else if (Math.abs(x - containerRight) <= glassThickness) {
        // Right edge
        glassChar = glassChars[0];
    } else if (Math.abs(y - containerTop) <= glassThickness || inCap && y < containerTop) {
        // Top edge
        glassChar = '-';
    } else if (Math.abs(y - containerBottom) <= glassThickness || inCap && y > containerBottom) {
        // Bottom edge
        glassChar = '-';
    } else {
        // Default glass character
        glassChar = glassChars[Math.floor(Math.random() * glassChars.length)];
    }
    
    // Glass color - slight tint based on nearby lava
    const hue = colorManager.getHue(x, y, 0, 0.1, time);
    const saturation = 10 + normalizedValue * 10;
    const lightness = 60 + normalizedValue * 20;
    
    grid.setCell(x, y, {
        character: glassChar,
        hue,
        saturation,
        lightness
    });
}

/**
 * Render a bubble
 * @param {Object} grid - Character grid
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} time - Current time in seconds
 * @param {Object} colorManager - Color manager
 */
export function renderBubble(grid, x, y, time, colorManager) {
    // Draw a bubble
    const charIndex = Math.floor(Math.random() * bubbleChars.length);
    
    // Bubble colors are bright/white
    const hue = colorManager.getHue(x, y, 0, 0.5, time);
    const saturation = 10;
    const lightness = 80 + Math.random() * 20;
    
    grid.setCell(x, y, {
        character: bubbleChars[charIndex],
        hue,
        saturation,
        lightness
    });
}

/**
 * Render lava
 * @param {Object} grid - Character grid
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} normalizedValue - Blob influence value (0-1)
 * @param {number} combinedPattern - Combined flow pattern value
 * @param {number} flowPattern - Flow pattern value
 * @param {number} blobHue - Blob-specific hue offset
 * @param {number} time - Current time in seconds
 * @param {Object} colorManager - Color manager
 */
export function renderLava(grid, x, y, normalizedValue, combinedPattern, flowPattern, blobHue, time, colorManager) {
    // Choose character based on influence level - creates nice variation
    let charSetIndex;
    if (normalizedValue < 0.4) {
        // Blob edges (lowest density)
        charSetIndex = Math.floor(flowPattern * 11) + 20;
    } else if (normalizedValue < 0.8) {
        // Blob mid-density
        charSetIndex = Math.floor(flowPattern * 12) + 8;
    } else {
        // Blob core (densest)
        charSetIndex = Math.floor(flowPattern * 8);
    }
    
    // Ensure in bounds
    charSetIndex = Math.min(charSetIndex, lavaChars.length - 1);
    
    // Get base hue from color manager, then apply blob-specific variation
    const baseHue = colorManager.getHue(x, y, 0, combinedPattern, time);
    
    // Calculate final hue with variation
    const hue = (baseHue + blobHue * 0.1) % 360;
    
    // Higher saturation for more vibrant lava
    const saturation = colorManager.saturation;
    
    // Brightness varies with influence and flow pattern
    const lightness = 30 + combinedPattern * 50 + flowPattern * 10;
    
    grid.setCell(x, y, {
        character: lavaChars[charSetIndex],
        hue,
        saturation,
        lightness
    });
}

/**
 * Render background (space outside the lamp or empty space inside)
 * @param {Object} grid - Character grid
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {boolean} insideLamp - Whether this is inside the lamp
 * @param {number} time - Current time in seconds
 * @param {Object} colorManager - Color manager
 */
export function renderBackground(grid, x, y, insideLamp, time, colorManager) {
    const charIndex = Math.floor(Math.random() * bgChars.length);
    const bgChar = bgChars[charIndex];
    
    let hue, saturation, lightness;
    
    if (insideLamp) {
        // Dark inside lamp
        hue = colorManager.getHue(x, y, 0, 0.2, time);
        saturation = 10;
        lightness = 5 + Math.random() * 10;
    } else {
        // Outside the lamp
        hue = colorManager.getHue(x, y, 0, 0.5, time);
        saturation = 10;
        lightness = 10 + Math.random() * 5;
    }
    
    grid.setCell(x, y, {
        character: bgChar,
        hue,
        saturation,
        lightness
    });
}
/**
 * Advanced metaball renderer for lava lamp animation
 */
import { smootherStep, lerp } from '../../../utils/math.js';

// Character sets for different parts of the lava lamp
const bgChars = [' ', '.', '·', ':', '·'];
const plasmaChars = [
    // Dense/bright characters
    '@', '#', '%', '&', '$', 'W', 'M', 'B', '8',
    // Medium density
    '*', '+', '=', '^', '~', '?', '-', ':', ';',
    // Low density
    '.', ',', '`', ' '
];

/**
 * Render the plasma effect
 * @param {Object} grid - Character grid 
 * @param {number} time - Current time
 * @param {Object} blobSystem - The blob system
 * @param {Array} characters - Available characters
 * @param {Object} colorManager - Color manager
 */
export function renderPlasma(grid, time, blobSystem, characters, colorManager) {
    const width = grid.width;
    const height = grid.height;
    const { blobs } = blobSystem;
    
    // Create buffer for metaball calculation
    const buffer = new Array(width * height).fill(0);
    
    // Calculate metaball influence at each point
    calculateMetaballField(buffer, width, height, blobs, time);
    
    // Apply ambient flow patterns
    applyAmbientPatterns(buffer, width, height, time);
    
    // Render to grid
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const value = buffer[index];
            
            // Calculate display character
            renderCell(grid, x, y, value, time, blobs, colorManager);
        }
    }
}

/**
 * Calculate metaball influence across the field
 * @param {Array} buffer - Buffer to store field values
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {Array} blobs - Array of blobs
 * @param {number} time - Current time
 */
function calculateMetaballField(buffer, width, height, blobs, time) {
    for (let y = 0; y < height; y++) {
        const normalizedY = y / height;
        
        for (let x = 0; x < width; x++) {
            const normalizedX = x / width;
            const bufferIndex = y * width + x;
            
            // Calculate combined blob influence at this point
            let totalValue = 0;
            let maxValue = 0;
            let nearestBlob = null;
            let nearestDist = Infinity;
            
            for (const blob of blobs) {
                // Skip if blob is invisible
                if (blob.opacity <= 0) continue;
                
                // Calculate field value using metaball equation
                const value = calculateBlobInfluence(normalizedX, normalizedY, blob, time);
                totalValue = combineBlobValues(totalValue, value * blob.opacity);
                
                // Track maximum value and nearest blob
                if (value > maxValue) {
                    maxValue = value;
                    
                    // Calculate actual distance to blob center
                    const dx = normalizedX - blob.x;
                    const dy = normalizedY - blob.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestBlob = blob;
                    }
                }
            }
            
            // Store color information along with density
            buffer[bufferIndex] = totalValue;
        }
    }
}

/**
 * Calculate individual blob influence at a point
 * @param {number} x - Normalized x coordinate
 * @param {number} y - Normalized y coordinate
 * @param {Object} blob - Blob to calculate influence for
 * @param {number} time - Current time
 * @returns {number} Influence value (0-1)
 */
function calculateBlobInfluence(x, y, blob, time) {
    // Calculate distance to blob center with wrapping
    let dx = x - blob.x;
    let dy = y - blob.y;
    
    // Handle wrapping (assuming normalized 0-1 coordinates)
    if (Math.abs(dx) > 0.5) dx = dx > 0 ? dx - 1 : dx + 1;
    if (Math.abs(dy) > 0.5) dy = dy > 0 ? dy - 1 : dy + 1;
    
    // Transform based on blob vertices to create non-circular shape
    const angle = Math.atan2(dy, dx);
    const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
    
    // Find two closest vertices and interpolate
    const vertexCount = blob.vertices.length;
    const vertexAngle = (Math.PI * 2) / vertexCount;
    const vertexIndex = Math.floor(normalizedAngle / vertexAngle);
    const nextIndex = (vertexIndex + 1) % vertexCount;
    
    const v1 = blob.vertices[vertexIndex];
    const v2 = blob.vertices[nextIndex];
    
    // Interpolation factor between vertices
    const t = (normalizedAngle - vertexIndex * vertexAngle) / vertexAngle;
    const morphDistance = lerp(v1.distance, v2.distance, t);
    
    // Calculate distance to blob edge
    const distance = Math.sqrt(dx * dx + dy * dy);
    const scaledDistance = distance / morphDistance;
    
    // Metaball equation for smooth falloff
    if (scaledDistance >= 1) return 0;
    
    // Smooth falloff function for metaball effect
    const q = 1 - scaledDistance * scaledDistance;
    return q * q * q;
}

/**
 * Combine blob values using screen blend for smoother transitions
 * @param {number} existing - Existing accumulated value
 * @param {number} adding - Value to add
 * @returns {number} Combined value
 */
function combineBlobValues(existing, adding) {
    return existing + adding - existing * adding;
}

/**
 * Apply ambient patterns to the field
 * @param {Array} buffer - Buffer to modify
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {number} time - Current time
 */
function applyAmbientPatterns(buffer, width, height, time) {
    // Add subtle background patterns
    for (let y = 0; y < height; y++) {
        const ny = y / height;
        
        for (let x = 0; x < width; x++) {
            const nx = x / width;
            const index = y * width + x;
            
            // Add subtle ambient glow
            const ambientPattern = Math.sin(nx * 4 + time * 0.2) * Math.cos(ny * 4 + time * 0.15) * 0.02;
            const backgroundGlow = Math.max(0, ambientPattern);
            
            // Add to buffer using screen blend
            buffer[index] = buffer[index] + backgroundGlow - buffer[index] * backgroundGlow;
        }
    }
    
    // Apply slight blur for glow effect
    applySimpleBlur(buffer, width, height);
}

/**
 * Apply a simple blur effect to the buffer
 * @param {Array} buffer - Buffer to blur
 * @param {number} width - Buffer width
 * @param {number} height - Buffer height
 */
function applySimpleBlur(buffer, width, height) {
    const tempBuffer = [...buffer];
    
    // Simple 3x3 blur kernel
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const index = y * width + x;
            const center = tempBuffer[index] * 0.4;
            const left = tempBuffer[index - 1] * 0.1;
            const right = tempBuffer[index + 1] * 0.1;
            const up = tempBuffer[index - width] * 0.1;
            const down = tempBuffer[index + width] * 0.1;
            const ul = tempBuffer[index - width - 1] * 0.05;
            const ur = tempBuffer[index - width + 1] * 0.05;
            const dl = tempBuffer[index + width - 1] * 0.05;
            const dr = tempBuffer[index + width + 1] * 0.05;
            
            buffer[index] = center + left + right + up + down + ul + ur + dl + dr;
        }
    }
}

/**
 * Render a single cell
 * @param {Object} grid - Character grid
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} value - Cell value (0-1)
 * @param {number} time - Current time
 * @param {Array} blobs - Array of all blobs
 * @param {Object} colorManager - Color manager
 */
function renderCell(grid, x, y, value, time, blobs, colorManager) {
    // Calculate display character index based on value
    // Enhance the boost factor for more defined blob edges
    const normValue = Math.min(1, value * 1.5); // Stronger boost for better contrast
    
    // Use power function to create more distinct transitions between dense/sparse areas
    const enhancedValue = Math.pow(normValue, 0.85); // Sharper transitions
    const charIndex = Math.floor(enhancedValue * (plasmaChars.length - 1));
    
    // More defined transition between background and blob
    const char = normValue > 0.03 ? plasmaChars[plasmaChars.length - 1 - charIndex] : bgChars[Math.floor(Math.random() * bgChars.length)];
    
    // Find the most influential blob at this point
    const nx = x / grid.width;
    const ny = y / grid.height;
    let dominantBlob = null;
    let maxInfluence = 0;
    
    for (const blob of blobs) {
        const influence = calculateBlobInfluence(nx, ny, blob, time) * blob.opacity;
        if (influence > maxInfluence) {
            maxInfluence = influence;
            dominantBlob = blob;
        }
    }
    
    // Set color based on the dominant blob or background
    let hue, saturation, lightness;
    
    // Calculate distance from center for color variation
    const distance = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2; // 0-1 distance from center
    
    if (dominantBlob && maxInfluence > 0.1) {
        // Use dominant blob's color, which is already synced with colorManager
        // in the updateBlobColor function
        hue = dominantBlob.hue;
        
        // Get the hue directly from colorManager - just like plasma does
        // This ensures we respect the color mode completely
        hue = colorManager.getHue(nx * grid.width, ny * grid.height, distance * Math.sqrt(grid.width*grid.width + grid.height*grid.height), normValue, time);
        
        // Use color manager's saturation directly - identical to plasma
        saturation = colorManager.saturation;
        
        // Calculate lightness like plasma does - 50 + normalizedValue * 30
        // But adapt it slightly for the blob structure
        const plasmaStyleLightness = 50 + normValue * 30;
        
        // Add a slight depth effect based on value for blob structure
        // Higher values (closer to blob center) get slightly brighter
        const depthEffect = Math.pow(normValue, 1.2) * 10;
        
        // Combine for final lightness
        lightness = plasmaStyleLightness + depthEffect;
    } else {
        // Background also uses plasma-style coloring
        hue = colorManager.getHue(nx * grid.width, ny * grid.height, distance * Math.sqrt(grid.width*grid.width + grid.height*grid.height), normValue, time);
        
        // Use saturation directly from colorManager for consistency with plasma
        saturation = colorManager.saturation;
        
        // For background, use plasma style but darker to create contrast with blobs
        lightness = Math.max(10, Math.min(40, (30 + normValue * 15))); // Darker variation of plasma style
    }
    
    // Set the cell
    grid.setCell(x, y, {
        character: char,
        hue,
        saturation,
        lightness
    });
}

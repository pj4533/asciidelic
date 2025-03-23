/**
 * Blob Creation module for lava lamp blobs
 * Handles creation of new blobs when splitting and merging
 */
import { random } from '../../../../utils/math.js';

/**
 * Create a blob that results from splitting a parent blob
 * @param {Object} parentBlob - The original blob being split
 * @param {number} size - Size for the new blob
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} time - Current time
 * @returns {Object} A new blob with inherited properties
 */
export function createSplitBlob(parentBlob, size, x, y, time) {
    // Ensure position is within bounds
    x = Math.max(0.05, Math.min(0.95, x));
    y = Math.max(0.05, Math.min(0.95, y));
    
    // Create vertices for morphing shape - inherit some of parent's blob characteristics
    const vertexCount = parentBlob.vertices.length;
    const vertices = [];
    for (let i = 0; i < vertexCount; i++) {
        const angle = (i / vertexCount) * Math.PI * 2;
        // Slightly different shape from parent
        const variationFactor = 0.7 + random(0, 0.6);
        const distance = size * variationFactor;
        
        vertices.push({
            angle,
            distance,
            targetDistance: distance,
            changeRate: random(0.7, 1.8) * parentBlob.morphRate
        });
    }
    
    // Create a new blob with some properties inherited from parent
    return {
        id: Math.random(),
        x, y, 
        size,
        vx: parentBlob.vx * (0.5 + random(0, 1)), 
        vy: parentBlob.vy * (0.5 + random(0, 1)),
        vertices,
        currentSize: size,
        age: 0,
        lifespan: parentBlob.lifespan * (0.4 + random(0, 0.5)), // Much shorter lifespan for split blobs
        opacity: 0.3, // Start partially visible
        hue: (parentBlob.hue + random(-20, 20) + 360) % 360, // Similar but not identical color
        saturation: Math.min(100, parentBlob.saturation + random(-10, 10)),
        lightness: Math.min(85, parentBlob.lightness + random(-10, 15)),
        targetSaturation: parentBlob.targetSaturation,
        targetLightness: parentBlob.targetLightness,
        hueShift: parentBlob.hueShift * (random(0.5, 1.5)),
        pulsePhase: random(0, Math.PI * 2),
        pulseRate: parentBlob.pulseRate * (0.8 + random(0, 0.4)),
        morphRate: parentBlob.morphRate * (0.8 + random(0, 0.4))
    };
}

/**
 * Create a blob that results from merging two parent blobs
 * @param {Object} blobA - First parent blob
 * @param {Object} blobB - Second parent blob
 * @param {number} time - Current time
 * @returns {Object} A new merged blob
 */
export function createMergedBlob(blobA, blobB, time) {
    // Calculate center position between the two blobs
    const x = (blobA.x + blobB.x) / 2;
    const y = (blobA.y + blobB.y) / 2;
    
    // New size is larger than either parent but not simply additive
    const size = Math.min(0.4, (blobA.size + blobB.size) * 0.85);
    
    // Average the velocities with a random factor
    const vx = (blobA.vx + blobB.vx) * 0.5 * (0.8 + random(0, 0.4));
    const vy = (blobA.vy + blobB.vy) * 0.5 * (0.8 + random(0, 0.4));
    
    // Create vertices for the new blob
    const vertexCount = Math.max(blobA.vertices.length, blobB.vertices.length);
    const vertices = [];
    for (let i = 0; i < vertexCount; i++) {
        const angle = (i / vertexCount) * Math.PI * 2;
        // Create interesting shapes by combining parent vertices
        const distFactorA = blobA.vertices[i % blobA.vertices.length].distance / blobA.size;
        const distFactorB = blobB.vertices[i % blobB.vertices.length].distance / blobB.size;
        const combinedDistFactor = (distFactorA + distFactorB) * 0.5;
        
        const distance = size * (combinedDistFactor * 0.7 + random(0.2, 0.5));
        vertices.push({
            angle,
            distance,
            targetDistance: distance,
            changeRate: random(0.5, 1.5) * Math.max(blobA.morphRate, blobB.morphRate)
        });
    }
    
    // Average lifespan, but without major bonuses to prevent accumulation
    const avgLifespan = (blobA.lifespan + blobB.lifespan) * 0.5;
    const avgAge = (blobA.age + blobB.age) * 0.5;
    const extraLifespan = 2 + random(0, 3); // Smaller bonus time from merging
    
    // Average the hues (being careful with the circular nature of hue)
    const hueDiff = ((blobB.hue - blobA.hue + 540) % 360) - 180;
    const hue = (blobA.hue + hueDiff * 0.5 + 360) % 360;
    
    // Create the merged blob
    return {
        id: Math.random(),
        x, y, 
        size,
        vx, vy,
        vertices,
        currentSize: size,
        age: avgAge * 0.7, // Reset age partially
        lifespan: avgLifespan + extraLifespan,
        opacity: Math.min(1, (blobA.opacity + blobB.opacity) * 0.7), // Start partially visible
        hue,
        saturation: Math.min(100, (blobA.saturation + blobB.saturation) * 0.55),
        lightness: Math.min(85, (blobA.lightness + blobB.lightness) * 0.55),
        targetSaturation: Math.min(100, (blobA.targetSaturation + blobB.targetSaturation) * 0.55),
        targetLightness: Math.min(85, (blobA.targetLightness + blobB.targetLightness) * 0.55),
        hueShift: (blobA.hueShift + blobB.hueShift) * 0.5,
        pulsePhase: random(0, Math.PI * 2),
        pulseRate: (blobA.pulseRate + blobB.pulseRate) * 0.5,
        morphRate: (blobA.morphRate + blobB.morphRate) * 0.5 * (1 + random(0, 0.5))
    };
}
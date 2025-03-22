/**
 * Interaction physics module for lava lamp blobs
 * Handles blob interactions, splitting, and merging
 */
import { random } from '../../../../utils/math.js';

/**
 * Apply interactions between blobs including splitting and merging
 * @param {Array} blobs - Array of all blobs
 * @param {number} dt - Delta time
 * @param {number} time - Current time
 * @param {Object} blobSystem - The blob system
 */
export function applyBlobInteractions(blobs, dt, time, blobSystem) {
    // Manage blob splitting and merging timers
    const shouldTrySplit = time - blobSystem.lastSplitTime > blobSystem.splitInterval + (Math.random() * blobSystem.actionVariance);
    const shouldTryMerge = time - blobSystem.lastMergeTime > blobSystem.mergeInterval + (Math.random() * blobSystem.actionVariance);
    const shouldTrySizeChange = time - blobSystem.lastSizeChangeTime > blobSystem.sizeChangeInterval + (Math.random() * blobSystem.actionVariance);
    
    // Attempt a size change on a random blob
    if (shouldTrySizeChange && blobs.length > 0) {
        const randomIndex = Math.floor(Math.random() * blobs.length);
        const targetBlob = blobs[randomIndex];
        
        if (targetBlob.age > 2 && targetBlob.age < targetBlob.lifespan * 0.8) {
            // Calculate life phase for more interesting timing
            const lifePhase = targetBlob.age / targetBlob.lifespan;
            
            // Randomly grow or shrink the blob
            if (Math.random() > 0.5) {
                // Grow the blob
                const growFactor = 1.2 + Math.random() * 0.3;
                targetBlob.size = Math.min(0.4, targetBlob.size * growFactor);
                // Larger blobs move slower
                targetBlob.vx *= 0.8;
                targetBlob.vy *= 0.8;
            } else {
                // Shrink the blob
                const shrinkFactor = 0.6 + Math.random() * 0.3;
                targetBlob.size = Math.max(0.05, targetBlob.size * shrinkFactor);
                // Smaller blobs move faster
                targetBlob.vx *= 1.2;
                targetBlob.vy *= 1.2;
            }
            
            // Update vertices for the new size
            for (const vertex of targetBlob.vertices) {
                vertex.targetDistance = targetBlob.size * (0.8 + random(0, 0.4));
                vertex.changeRate = random(1.0, 2.0) * targetBlob.morphRate; // Faster change after resize
            }
            
            // Update pulse parameters for more interesting effects
            targetBlob.pulseRate = random(0.5, 2.5);
            targetBlob.morphRate = random(0.5, 1.5);
            
            blobSystem.lastSizeChangeTime = time;
        }
    }
    
    // Try to split a blob if needed
    if (shouldTrySplit && blobs.length < blobSystem.maxBlobs * 0.8) {
        // Find a candidate for splitting (larger, older blobs)
        const candidates = blobs.filter(blob => 
            blob.size > 0.15 && 
            blob.age > 3 && 
            blob.age < blob.lifespan * 0.7
        );
        
        if (candidates.length > 0) {
            // Pick a random candidate
            const parentBlob = candidates[Math.floor(Math.random() * candidates.length)];
            
            // Create two smaller child blobs
            const childSize = parentBlob.size * 0.6;
            const offsetDistance = parentBlob.size * 0.3;
            const splitAngle = Math.random() * Math.PI * 2;
            
            // Create first child at slight offset
            const child1 = createSplitBlob(
                parentBlob, 
                childSize,
                parentBlob.x + Math.cos(splitAngle) * offsetDistance,
                parentBlob.y + Math.sin(splitAngle) * offsetDistance,
                time
            );
            
            // Create second child at opposite offset
            const child2 = createSplitBlob(
                parentBlob, 
                childSize,
                parentBlob.x - Math.cos(splitAngle) * offsetDistance,
                parentBlob.y - Math.sin(splitAngle) * offsetDistance,
                time
            );
            
            // Add velocity in opposite directions - higher to disperse blobs more
            const splitVelocity = 0.08 + Math.random() * 0.07;
            child1.vx += Math.cos(splitAngle) * splitVelocity;
            child1.vy += Math.sin(splitAngle) * splitVelocity;
            child2.vx -= Math.cos(splitAngle) * splitVelocity;
            child2.vy -= Math.sin(splitAngle) * splitVelocity;
            
            // Add the children and remove the parent
            blobs.push(child1);
            blobs.push(child2);
            
            // Find and remove the parent blob
            const parentIndex = blobs.indexOf(parentBlob);
            if (parentIndex !== -1) {
                blobs.splice(parentIndex, 1);
            }
            
            blobSystem.lastSplitTime = time;
            return; // Skip normal interactions this frame
        }
    }
    
    // Process normal blob interactions and potential merging
    for (let i = 0; i < blobs.length; i++) {
        const blobA = blobs[i];
        
        for (let j = i + 1; j < blobs.length; j++) {
            const blobB = blobs[j];
            
            // Check distance between blobs
            const dx = blobA.x - blobB.x;
            const dy = blobA.y - blobB.y;
            
            // Handle wrapping (assuming normalized 0-1 coordinates)
            const wrappedDx = Math.abs(dx) > 0.5 ? (dx > 0 ? dx - 1 : dx + 1) : dx;
            const wrappedDy = Math.abs(dy) > 0.5 ? (dy > 0 ? dy - 1 : dy + 1) : dy;
            
            // Calculate distance with wrapping
            const distance = Math.sqrt(wrappedDx * wrappedDx + wrappedDy * wrappedDy);
            const interactionRadius = (blobA.currentSize + blobB.currentSize) * 0.7;
            
            // Check for merge possibility
            if (shouldTryMerge && 
                distance < interactionRadius * 0.3 && 
                blobA.age > 2 && blobB.age > 2 && 
                blobs.length > blobSystem.maxBlobs * 0.5) {
                
                // Create a merged blob
                const mergedBlob = createMergedBlob(blobA, blobB, time);
                
                // Add the merged blob
                blobs.push(mergedBlob);
                
                // Remove the original blobs
                const indexB = blobs.indexOf(blobB);
                if (indexB !== -1) {
                    blobs.splice(indexB, 1);
                }
                
                const indexA = blobs.indexOf(blobA);
                if (indexA !== -1) {
                    blobs.splice(indexA, 1);
                }
                
                blobSystem.lastMergeTime = time;
                return; // Skip further processing this frame
            }
            
            // If blobs are close enough to interact
            if (distance < interactionRadius) {
                // Enhanced interaction forces
                const strength = (1 - distance / interactionRadius) * 0.15;
                const angle = Math.atan2(wrappedDy, wrappedDx);
                
                // Add slight attraction when moderately close, repulsion when very close
                let forceMultiplier = 1.0;
                
                if (distance > interactionRadius * 0.6) {
                    // Slight attraction when moderately close
                    forceMultiplier = -0.3;
                } else if (distance < interactionRadius * 0.3) {
                    // Stronger repulsion when very close
                    forceMultiplier = 2.0;
                }
                
                // Apply forces
                blobA.vx -= Math.cos(angle) * strength * forceMultiplier * dt;
                blobA.vy -= Math.sin(angle) * strength * forceMultiplier * dt;
                blobB.vx += Math.cos(angle) * strength * forceMultiplier * dt;
                blobB.vy += Math.sin(angle) * strength * forceMultiplier * dt;
                
                // Enhanced color blending with more vibrant effects
                if (distance < interactionRadius * 0.5) {
                    // More aggressive blend factor for faster color mixing
                    const blendFactor = 0.1 * dt * (1 - distance / (interactionRadius * 0.5));
                    
                    // Average the hues with circular handling
                    const hueDiff = ((blobB.hue - blobA.hue + 540) % 360) - 180;
                    blobA.hue = (blobA.hue + hueDiff * blendFactor + 360) % 360;
                    blobB.hue = (blobB.hue - hueDiff * blendFactor + 360) % 360;
                    
                    // Blend saturation and lightness (linear values)
                    const satDiff = blobB.saturation - blobA.saturation;
                    const lightDiff = blobB.lightness - blobA.lightness;
                    
                    blobA.saturation += satDiff * blendFactor;
                    blobB.saturation -= satDiff * blendFactor;
                    blobA.lightness += lightDiff * blendFactor;
                    blobB.lightness -= lightDiff * blendFactor;
                    
                    // Add slight distortion to blob shapes when interacting
                    for (const vertex of blobA.vertices) {
                        vertex.targetDistance = blobA.size * (0.7 + random(0, 0.5));
                        vertex.changeRate = Math.max(vertex.changeRate, random(0.8, 1.2));
                    }
                    
                    for (const vertex of blobB.vertices) {
                        vertex.targetDistance = blobB.size * (0.7 + random(0, 0.5));
                        vertex.changeRate = Math.max(vertex.changeRate, random(0.8, 1.2));
                    }
                }
            }
        }
    }
}

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
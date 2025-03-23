/**
 * Interaction physics module for lava lamp blobs
 * Handles blob interactions, splitting, and merging
 */
import { random } from '../../../../utils/math.js';
import { createSplitBlob, createMergedBlob } from './blobCreation.js';

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
    
    // Handle size change if needed
    if (shouldTrySizeChange && blobs.length > 0) {
        handleBlobSizeChange(blobs, time, blobSystem);
    }
    
    // Try to split a blob if needed
    if (shouldTrySplit && blobs.length < blobSystem.maxBlobs * 0.8) {
        if (handleBlobSplit(blobs, time, blobSystem)) {
            return; // Skip normal interactions this frame if split occurred
        }
    }
    
    // Process normal blob interactions and potential merging
    processBlobInteractions(blobs, dt, time, blobSystem, shouldTryMerge);
}

/**
 * Handle a random blob size change
 * @param {Array} blobs - Array of all blobs
 * @param {number} time - Current time
 * @param {Object} blobSystem - The blob system
 */
function handleBlobSizeChange(blobs, time, blobSystem) {
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

/**
 * Handle blob splitting
 * @param {Array} blobs - Array of all blobs
 * @param {number} time - Current time
 * @param {Object} blobSystem - The blob system
 * @returns {boolean} True if a split occurred
 */
function handleBlobSplit(blobs, time, blobSystem) {
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
        return true; // Split occurred
    }
    
    return false; // No split occurred
}

/**
 * Process interactions between blobs
 * @param {Array} blobs - Array of all blobs
 * @param {number} dt - Delta time
 * @param {number} time - Current time
 * @param {Object} blobSystem - The blob system
 * @param {boolean} shouldTryMerge - Whether merge should be attempted
 */
function processBlobInteractions(blobs, dt, time, blobSystem, shouldTryMerge) {
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
                handleBlobForces(blobA, blobB, wrappedDx, wrappedDy, distance, interactionRadius, dt);
                handleColorBlending(blobA, blobB, distance, interactionRadius, dt);
            }
        }
    }
}

/**
 * Apply forces between two interacting blobs
 * @param {Object} blobA - First blob
 * @param {Object} blobB - Second blob
 * @param {number} wrappedDx - X distance with wrapping
 * @param {number} wrappedDy - Y distance with wrapping
 * @param {number} distance - Distance between blobs
 * @param {number} interactionRadius - Radius for interaction
 * @param {number} dt - Delta time
 */
function handleBlobForces(blobA, blobB, wrappedDx, wrappedDy, distance, interactionRadius, dt) {
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
}

/**
 * Handle color blending and shape distortion between interacting blobs
 * @param {Object} blobA - First blob
 * @param {Object} blobB - Second blob
 * @param {number} distance - Distance between blobs
 * @param {number} interactionRadius - Radius for interaction
 * @param {number} dt - Delta time
 */
function handleColorBlending(blobA, blobB, distance, interactionRadius, dt) {
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
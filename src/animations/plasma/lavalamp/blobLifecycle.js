/**
 * Blob lifecycle management for lava lamp animation
 */
import { generateBlobByPhase, calculateCurrent } from './blobPhysics.js';

/**
 * Create all blobs for the animation
 * @param {number} maxBlobs - Maximum number of blobs
 * @param {number} slowTime - Slowed time value
 * @param {number} containerLeft - Left edge of container
 * @param {number} containerRight - Right edge of container
 * @param {number} containerTop - Top edge of container
 * @param {number} containerBottom - Bottom edge of container
 * @param {number} containerWidth - Width of container
 * @param {number} minBlobSize - Minimum blob size
 * @param {number} maxBlobSize - Maximum blob size
 * @param {number} deltaTime - Time since last update in seconds
 * @returns {Array} Array of blob objects
 */
export function createBlobs(maxBlobs, slowTime, containerLeft, containerRight, containerTop, containerBottom, containerWidth, minBlobSize, maxBlobSize, deltaTime) {
    const blobs = [];
    
    // Create blobs with varied properties
    for (let i = 0; i < maxBlobs; i++) {
        const seed = i * 1234.5678 + slowTime * 0.01;
        
        // Use i as a base for lifecycle timing to ensure blobs are at different phases
        const lifecycleOffset = (i / maxBlobs) * 10; // Spread blobs throughout lifecycle
        const lifecyclePosition = (slowTime * 0.1 + lifecycleOffset) % 10; // 0-10 lifecycle position
        
        // Determine blob phase based on lifecycle position
        let phase, phaseProgress;
        
        if (lifecyclePosition < 1) {
            phase = 'forming';
            phaseProgress = lifecyclePosition; // 0-1
        } else if (lifecyclePosition < 5) {
            phase = 'rising';
            phaseProgress = (lifecyclePosition - 1) / 4; // 0-1
        } else if (lifecyclePosition < 6) {
            phase = 'ceiling';
            phaseProgress = lifecyclePosition - 5; // 0-1
        } else if (lifecyclePosition < 9) {
            phase = 'descending';
            phaseProgress = (lifecyclePosition - 6) / 3; // 0-1
        } else {
            phase = 'merging';
            phaseProgress = lifecyclePosition - 9; // 0-1
        }
        
        // Generate blob based on its phase
        const blobProps = generateBlobByPhase(
            phase, 
            phaseProgress, 
            containerLeft, 
            containerRight, 
            containerTop, 
            containerBottom, 
            containerWidth, 
            minBlobSize, 
            maxBlobSize, 
            seed, 
            slowTime
        );
        
        // Apply current effects for blobs in motion phases
        let { x, y, size, stretch, wobble, opacity } = blobProps;
        
        if (phase === 'rising' || phase === 'descending') {
            // Apply fluid currents when in motion
            const heatVariation = Math.sin(slowTime * 0.3) * 0.01 + 0.01;
            x += calculateCurrent(x, y, containerLeft, containerTop, containerBottom, containerRight - containerLeft, heatVariation) * 100 * deltaTime;
        }
        
        // Unique characteristics for each blob
        const colorOffset = (i / maxBlobs) * 360; // Ensure color variation
        const blobTemperature = 0.3 + Math.sin(seed * 7.5) * 0.2; // Some blobs hotter than others
        
        blobs.push({ 
            x, y, size, stretch, seed, phase, phaseProgress, 
            wobble, opacity, colorOffset, blobTemperature
        });
    }
    
    return blobs;
}
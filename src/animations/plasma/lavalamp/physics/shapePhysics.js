/**
 * Shape physics module for lava lamp blobs
 * Handles morphing, pulsing, and shape deformation
 */
import { random, lerp } from '../../../../utils/math.js';

/**
 * Update blob shape by morphing its vertices
 * @param {Object} blob - The blob to update
 * @param {number} time - Current time
 * @param {number} dt - Delta time
 */
export function updateBlobShape(blob, time, dt) {
    // Update pulse size with more complex pulsing behavior
    blob.pulsePhase += dt * blob.pulseRate;
    
    // Use a combination of sine waves with different frequencies for more organic pulsing
    const primaryPulse = Math.sin(blob.pulsePhase) * 0.12;
    const secondaryPulse = Math.sin(blob.pulsePhase * 0.5 + blob.id) * 0.06;
    const tertiaryPulse = Math.sin(blob.pulsePhase * 0.25 + time * 0.2) * 0.03;
    
    // Combine pulses for more organic effect
    const pulseFactor = 1 + primaryPulse + secondaryPulse + tertiaryPulse;
    
    // Apply pulse factor to current size
    blob.currentSize = blob.size * pulseFactor;
    
    // Get blob's life phase for more interesting morphing patterns
    const lifePhase = blob.age / blob.lifespan;
    
    // More active morphing in the middle of blob's life
    const morphActivity = lifePhase > 0.2 && lifePhase < 0.8 ? 
        Math.sin(lifePhase * Math.PI) + 0.5 : 0.5;
    
    // Apply wave deformation around the blob's perimeter
    // This creates traveling waves along the blob's surface
    const waveStrength = 0.15 * morphActivity;
    const waveSpeed = time * 1.5;
    
    // Update vertices with more dynamic behavior
    for (let i = 0; i < blob.vertices.length; i++) {
        const vertex = blob.vertices[i];
        const vertexAngle = vertex.angle;
        
        // Calculate wave deformation
        const waveFactor = 1 + Math.sin(vertexAngle * 3 + waveSpeed + blob.id) * waveStrength;
        
        // If close to target or more frequent random chance to change target
        const changeChance = 0.01 * blob.morphRate * (1 + morphActivity);
        if (Math.abs(vertex.distance - vertex.targetDistance) < 0.005 || 
            Math.random() < changeChance) {
            
            // Set new target distance with more varied shapes
            // Base vertex distance on size but allow for more extreme deformations
            const baseDistance = blob.size * waveFactor;
            const variationRange = blob.size * 0.6; // Greater range for more interesting shapes
            
            vertex.targetDistance = baseDistance * (0.7 + random(0, variationRange));
            
            // Faster morphing during middle of life
            vertex.changeRate = random(0.5, 2.0) * blob.morphRate * (0.8 + morphActivity * 0.5);
        }
        
        // Move toward target with variable speed
        // More rapid changes for more active behavior
        const morphSpeed = vertex.changeRate * (1 + morphActivity * 0.3) * dt;
        vertex.distance = lerp(vertex.distance, vertex.targetDistance, morphSpeed);
    }
}
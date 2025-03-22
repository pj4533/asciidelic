/**
 * Motion physics module for lava lamp blobs
 * Handles flow forces, buoyancy, and movement patterns
 */
import { random } from '../../../../utils/math.js';

/**
 * Apply flow field forces to a blob
 * @param {Object} blob - The blob to update
 * @param {number} time - Current time
 * @param {number} dt - Delta time
 */
export function applyFlowForces(blob, time, dt) {
    // Calculate position in the flow field
    const nx = blob.x;
    const ny = blob.y;
    
    // Get blob's life phase for varied behavior
    const lifePhase = blob.age / blob.lifespan;
    
    // Create multiple flow fields with varying frequencies for more organic movement
    // Increased magnitude significantly for more movement
    const flowX1 = Math.sin(ny * 3 + time * 0.2) * 0.12;  // Tripled strength and doubled speed
    const flowY1 = Math.cos(nx * 3 + time * 0.25) * 0.12;
    
    const flowX2 = Math.sin(ny * 5 + time * 0.15 + blob.id * 2) * 0.08;  // Quadrupled strength
    const flowY2 = Math.cos(nx * 5 + time * 0.12 + blob.id * 2) * 0.08;
    
    // Combine flow fields
    const flowX = flowX1 + flowX2;
    const flowY = flowY1 + flowY2;
    
    // Multiple vortex centers for more complex flow patterns
    
    // Primary vortex - moving center with much stronger effect
    const primaryStrength = 0.06;  // Tripled strength
    const centerX1 = 0.5 + Math.sin(time * 0.3) * 0.25;  // Increased movement range
    const centerY1 = 0.5 + Math.cos(time * 0.2) * 0.2;
    const dx1 = nx - centerX1;
    const dy1 = ny - centerY1;
    const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const vortexFactor1 = Math.max(0, 0.6 - distance1) * primaryStrength;
    
    // Secondary vortex - smaller, faster moving
    const secondaryStrength = 0.04;  // Quadrupled strength
    const centerX2 = 0.3 + Math.sin(time * 0.15) * 0.15;  // Faster movement
    const centerY2 = 0.7 + Math.cos(time * 0.12) * 0.15;
    const dx2 = nx - centerX2;
    const dy2 = ny - centerY2;
    const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const vortexFactor2 = Math.max(0, 0.4 - distance2) * secondaryStrength;
    
    // Tertiary anti-vortex (spins in opposite direction)
    const tertiaryStrength = 0.03;  // Almost 4x stronger
    const centerX3 = 0.7 + Math.sin(time * 0.18) * 0.15;
    const centerY3 = 0.3 + Math.cos(time * 0.13) * 0.15;
    const dx3 = nx - centerX3;
    const dy3 = ny - centerY3;
    const distance3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
    const vortexFactor3 = Math.max(0, 0.35 - distance3) * tertiaryStrength;
    
    // Apply combined forces from all flow fields and vortices
    // Primary vortex
    blob.vx += (flowX - dy1 * vortexFactor1) * dt * 2;
    blob.vy += (flowY + dx1 * vortexFactor1) * dt * 2;
    
    // Secondary vortex (same rotation direction)
    blob.vx += (-dy2 * vortexFactor2) * dt * 2;
    blob.vy += (dx2 * vortexFactor2) * dt * 2;
    
    // Tertiary anti-vortex (opposite rotation direction)
    blob.vx += (dy3 * vortexFactor3) * dt * 2;
    blob.vy += (-dx3 * vortexFactor3) * dt * 2;
    
    // Add random turbulence for all blobs - makes them more erratic
    // Stronger for small blobs, but present for all sizes
    const sizeFactor = blob.size < 0.15 ? 2.5 : 1.0;
    const turbulence = 0.05 * Math.sin(time * 8 + blob.id * 20) * sizeFactor;  // 5x stronger turbulence
    blob.vx += turbulence * dt * (Math.sin(time * 5 + blob.id * 10));  // Faster turbulence
    blob.vy += turbulence * dt * (Math.cos(time * 5 + blob.id * 10));
}

/**
 * Apply buoyancy and gravity to a blob
 * @param {Object} blob - The blob to update
 * @param {number} dt - Delta time
 * @param {number} time - Current time
 */
export function applyBuoyancy(blob, dt, time) {
    // Calculate blob's life phase (0-1)
    const lifePhase = blob.age / blob.lifespan;
    
    // Dramatically enhanced buoyancy with much more variance
    // Smaller blobs float faster, larger blobs sink and rise more erratically
    // Using a combination of sine waves with different frequencies and phases
    const oscillation = 
        Math.sin(time * 1.2 + blob.id * 5) * 0.6 +  // Faster and stronger oscillation
        Math.sin(time * 0.5 + blob.id * 12) * 0.4 + // Stronger secondary wave
        Math.cos(time * 0.8 + blob.id * 7) * 0.3;   // Faster tertiary wave
    
    // More dynamic buoyancy that changes throughout blob's life
    // Increased base buoyancy factor significantly
    let buoyancyFactor = 0.16 * (1 - blob.size * 0.5) * (1 + oscillation);  // Doubled base strength
    
    // Add life-cycle modulation - middle-aged blobs move more actively
    if (lifePhase > 0.2 && lifePhase < 0.8) {
        buoyancyFactor *= 1.0 + Math.sin(lifePhase * Math.PI) * 0.8;  // More pronounced lifecycle effect
    }
    
    // Apply buoyancy with more variance
    blob.vy -= buoyancyFactor * dt;
    
    // Apply gravity relative to size - larger blobs have more gravity pull
    // Increased base gravity for faster downward movement
    blob.vy += (0.04 + 0.05 * blob.size) * dt;  // Doubled gravity force
    
    // Apply horizontal drift for more interesting motion
    // More pronounced in the middle of blob's life and much stronger overall
    const horizontalFactor = Math.sin(time * 0.3 + blob.id * 3) * 0.08 * Math.sin(lifePhase * Math.PI);  // Almost 3x stronger
    blob.vx += horizontalFactor * dt;
}
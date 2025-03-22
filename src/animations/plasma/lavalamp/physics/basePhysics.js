/**
 * Base physics module for lava lamp blobs
 * Handles lifecycle management and core physics updates
 */
import { updateBlobShape } from './shapePhysics.js';
import { updateBlobColor } from './colorPhysics.js';
import { applyFlowForces, applyBuoyancy } from './motionPhysics.js';
import { applyBlobInteractions } from './interactionPhysics.js';
import { spawnNewBlobs } from './spawnPhysics.js';

/**
 * Apply physics to all blobs in the system
 * @param {Object} blobSystem - Blob system with blobs array
 * @param {number} time - Current time for motion
 * @param {number} deltaTime - Time elapsed since last frame
 * @param {number} colorTime - Separate time value for color calculations
 */
export function applyPhysics(blobSystem, time, deltaTime, colorTime) {
    const { blobs } = blobSystem;
    const dt = Math.min(deltaTime, 0.1); // Cap delta time to prevent instability
    
    // Store the separate color time in the blob system
    blobSystem.colorTime = colorTime || time;
    
    // Update existing blobs
    for (let i = blobs.length - 1; i >= 0; i--) {
        const blob = blobs[i];
        
        // Store reference to blob system for colorManager access
        blob.system = blobSystem;
        
        // Update age - faster aging for larger blobs to prevent screen filling
        const sizeAgeModifier = 1.0 + (blob.size * 1.5); // Larger blobs age up to 2.5x faster
        blob.age += dt * sizeAgeModifier;
        
        // Remove expired blobs or force remove oldest ones if we have too many
        if (blob.age >= blob.lifespan || (blobs.length > blobSystem.maxBlobs * 0.9 && i < 3)) {
            blobs.splice(i, 1);
            continue;
        }
        
        // Calculate life phase (0-1)
        const lifePhase = blob.age / blob.lifespan;
        
        // Update opacity based on lifecycle
        if (lifePhase < 0.1) {
            // Fade in
            blob.opacity = lifePhase / 0.1;
        } else if (lifePhase > 0.9) {
            // Fade out
            blob.opacity = (1 - lifePhase) / 0.1;
        } else {
            blob.opacity = 1;
        }
        
        // Apply flow field forces
        applyFlowForces(blob, time, dt);
        
        // Apply buoyancy and gravity
        applyBuoyancy(blob, dt, time);
        
        // Apply velocity to position
        blob.x += blob.vx * dt;
        blob.y += blob.vy * dt;
        
        // Apply friction
        blob.vx *= 0.98;
        blob.vy *= 0.98;
        
        // Wrap around edges
        if (blob.x < 0) blob.x += 1;
        if (blob.x > 1) blob.x -= 1;
        if (blob.y < 0) blob.y += 1;
        if (blob.y > 1) blob.y -= 1;
        
        // Update blob shape
        updateBlobShape(blob, time, dt);
        
        // Update colors using colorTime (separate from motion time)
        updateBlobColor(blob, blobSystem.colorTime, dt);
    }
    
    // Spawn new blobs if needed
    spawnNewBlobs(blobSystem, time);
    
    // Apply blob interactions - pass the blobSystem for splitting and merging
    applyBlobInteractions(blobs, dt, time, blobSystem);
}
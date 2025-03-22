/**
 * Advanced blob physics simulation for lava lamp animation
 */
import { lerp, random, smootherStep } from '../../../utils/math.js';

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
        
        // Update age
        blob.age += dt;
        
        // Remove expired blobs
        if (blob.age >= blob.lifespan) {
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
    
    // Apply blob interactions
    applyBlobInteractions(blobs, dt, time);
}

/**
 * Apply flow field forces to a blob
 * @param {Object} blob - The blob to update
 * @param {number} time - Current time
 * @param {number} dt - Delta time
 */
function applyFlowForces(blob, time, dt) {
    // Calculate position in the flow field
    const nx = blob.x;
    const ny = blob.y;
    
    // Create flow field based on sin/cos waves
    const flowX = Math.sin(ny * 3 + time * 0.1) * 0.05;
    const flowY = Math.cos(nx * 3 + time * 0.13) * 0.05;
    
    // Create vortex effects
    const vortexStrength = 0.02;
    const centerX = 0.5 + Math.sin(time * 0.2) * 0.15;
    const centerY = 0.5 + Math.cos(time * 0.1) * 0.1;
    const dx = nx - centerX;
    const dy = ny - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const vortexFactor = Math.max(0, 0.5 - distance) * vortexStrength;
    
    // Apply forces
    blob.vx += (flowX - dy * vortexFactor) * dt * 2;
    blob.vy += (flowY + dx * vortexFactor) * dt * 2;
}

/**
 * Apply buoyancy and gravity to a blob
 * @param {Object} blob - The blob to update
 * @param {number} dt - Delta time
 * @param {number} time - Current time
 */
function applyBuoyancy(blob, dt, time) {
    // Calculate buoyancy based on size and a time oscillation
    const buoyancyFactor = 0.05 * (1 - blob.size * 0.5) * (1 + Math.sin(time + blob.id * 8) * 0.2);
    
    // Apply buoyancy (upward force)
    blob.vy -= buoyancyFactor * dt;
    
    // Apply gravity (downward force)
    blob.vy += 0.02 * blob.size * dt;
}

/**
 * Update blob shape by morphing its vertices
 * @param {Object} blob - The blob to update
 * @param {number} time - Current time
 * @param {number} dt - Delta time
 */
function updateBlobShape(blob, time, dt) {
    // Update pulse size
    blob.pulsePhase += dt * blob.pulseRate;
    const pulseFactor = 1 + Math.sin(blob.pulsePhase) * 0.15;
    blob.currentSize = blob.size * pulseFactor;
    
    // Update vertices
    for (let i = 0; i < blob.vertices.length; i++) {
        const vertex = blob.vertices[i];
        
        // If close to target or random chance to change target
        if (Math.abs(vertex.distance - vertex.targetDistance) < 0.01 || 
            Math.random() < 0.01 * blob.morphRate) {
            // Set new target distance
            vertex.targetDistance = blob.size * (0.8 + random(0, 0.4));
            vertex.changeRate = random(0.5, 1.5) * blob.morphRate;
        }
        
        // Move toward target
        vertex.distance = lerp(vertex.distance, vertex.targetDistance, vertex.changeRate * dt);
    }
}

/**
 * Update blob color over time
 * @param {Object} blob - The blob to update
 * @param {number} time - Current time
 * @param {number} dt - Delta time
 */
function updateBlobColor(blob, time, dt) {
    // Get color manager from blob system if we're in a system context
    const colorManager = blob.system?.colorManager;
    
    if (colorManager) {
        // Adjust target colors to stay in theme with color manager
        const nx = blob.x;
        const ny = blob.y;
        const distance = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2;
        const value = blob.age / blob.lifespan; // Use life phase as a value parameter
        
        // Calculate base hue from color manager (respects color mode)
        const baseHue = colorManager.getHue(nx, ny, distance, value, time);
        
        // Adjust the blob's hue to orbit around the base hue from color manager
        const currentHueDiff = ((blob.hue - baseHue + 540) % 360) - 180;
        
        // If the hue is far from the base, pull it closer
        if (Math.abs(currentHueDiff) > 30) {
            blob.hue = (blob.hue + (baseHue - blob.hue) * 0.02 * dt) % 360;
            if (blob.hue < 0) blob.hue += 360;
        } else {
            // Otherwise apply small hue shift over time
            blob.hue += blob.hueShift * dt;
            if (blob.hue > 360) blob.hue -= 360;
            if (blob.hue < 0) blob.hue += 360;
        }
        
        // Set saturation and lightness targets from color manager
        blob.targetSaturation = colorManager.saturation * (0.7 + random(0, 0.3));
        blob.targetLightness = colorManager.lightness * (0.8 + random(0, 0.4));
    } else {
        // Original behavior if no color manager
        blob.hue += blob.hueShift * dt;
        if (blob.hue > 360) blob.hue -= 360;
        if (blob.hue < 0) blob.hue += 360;
        
        // Occasionally adjust saturation and lightness targets
        if (Math.random() < 0.005) {
            blob.targetSaturation = random(70, 100);
            blob.targetLightness = random(40, 70);
        }
    }
    
    // Occasionally pick a new hue shift direction (less frequent for more stability)
    if (Math.random() < 0.003) {
        blob.hueShift = random(-3, 3);
    }
    
    // Move current values toward targets (more slowly)
    blob.saturation = lerp(blob.saturation, blob.targetSaturation, 0.05 * dt);
    blob.lightness = lerp(blob.lightness, blob.targetLightness, 0.05 * dt);
}

/**
 * Spawn new blobs if needed
 * @param {Object} blobSystem - The blob system
 * @param {number} time - Current time
 */
function spawnNewBlobs(blobSystem, time) {
    const { blobs, maxBlobs, lastSpawnTime, colorManager } = blobSystem;
    
    // Initial blob generation - ensure we have at least a minimum number of blobs
    if (blobs.length < 10) {
        // Create multiple blobs at once for initial population
        const numToCreate = 10 - blobs.length;
        for (let i = 0; i < numToCreate; i++) {
            blobs.push(createBlob(time + i * 0.1, colorManager));
        }
        blobSystem.lastSpawnTime = time;
        return;
    }
    
    // Regular spawning
    // Determine if we should spawn a new blob
    const shouldSpawn = blobs.length < maxBlobs && time - lastSpawnTime > blobSystem.spawnInterval;
    
    if (shouldSpawn) {
        // Create a new blob
        blobs.push(createBlob(time, colorManager));
        blobSystem.lastSpawnTime = time;
    }
}

/**
 * Create a new blob with properties based on colorManager
 * @param {number} time - Current time
 * @param {Object} colorManager - Color manager for consistent theming
 * @returns {Object} A new blob
 */
function createBlob(time, colorManager) {
    // Base properties
    const size = random(0.1, 0.3); // Increased max size from 0.25 to 0.3
    const lifespan = random(20, 40); // Increased from 15-30 to 20-40 for longer-lived blobs
    
    // Random position
    const x = random(0.1, 0.9);
    const y = random(0.1, 0.9);
    
    // Random velocity
    const vx = random(-0.05, 0.05);
    const vy = random(-0.05, 0.05);
    
    // Color properties based on colorManager
    let hue, saturation, lightness;
    
    if (colorManager) {
        // Use colorTime from the blobSystem if available
        const colorTime = colorManager.blobSystem?.colorTime || time;
        
        // Calculate a position-based value for color determination
        const nx = x;
        const ny = y;
        const distance = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2; // 0-1 distance from center
        const value = random(0, 1);
        
        // Use colorManager's color scheme
        hue = colorManager.getHue(nx, ny, distance, value, colorTime);
        
        // Add more variation for psychedelic effect but still stay within theme
        hue = (hue + random(-25, 25)) % 360;
        
        // Higher saturation range for more vivid colors (80-100%)
        saturation = Math.min(100, Math.max(80, colorManager.saturation * 0.3 + random(60, 80)));
        
        // Higher lightness range for brighter blobs (50-80%)
        lightness = Math.min(80, Math.max(50, colorManager.lightness * 0.4 + random(40, 60)));
    } else {
        // Fallback to random if no colorManager
        hue = random(0, 360);
        saturation = random(80, 100); // Higher saturation for psychedelic effect
        lightness = random(50, 80); // Brighter for more vivid effect
    }
    
    // Create vertices for morphing shape
    const vertexCount = 8;
    const vertices = [];
    for (let i = 0; i < vertexCount; i++) {
        const angle = (i / vertexCount) * Math.PI * 2;
        const distance = size * (0.8 + random(0, 0.4));
        vertices.push({
            angle,
            distance,
            targetDistance: distance,
            changeRate: random(0.5, 1.5)
        });
    }
    
    return {
        id: Math.random(), // Unique ID for the blob
        x, y, size, // Position and size
        vx, vy, // Velocity
        vertices, // Morphing shape data
        currentSize: size, // Current displayed size with pulse
        age: 0, // Current age in seconds
        lifespan: lifespan, // Total lifespan in seconds
        opacity: 0, // Start transparent
        hue, saturation, lightness, // HSL color values
        targetSaturation: saturation, // Target saturation
        targetLightness: lightness, // Target lightness
        hueShift: random(-3, 3), // Rate of hue change
        pulsePhase: random(0, Math.PI * 2), // Current pulse phase
        pulseRate: random(0.5, 2), // Rate of size pulsing
        morphRate: random(0.3, 1.2) // Rate of shape morphing
    };
}

/**
 * Apply interactions between blobs
 * @param {Array} blobs - Array of all blobs
 * @param {number} dt - Delta time
 * @param {number} time - Current time
 */
function applyBlobInteractions(blobs, dt, time) {
    for (let i = 0; i < blobs.length; i++) {
        const blobA = blobs[i];
        
        for (let j = i + 1; j < blobs.length; j++) {
            const blobB = blobs[j];
            
            // Calculate distance with wrapping
            let dx = blobB.x - blobA.x;
            let dy = blobB.y - blobA.y;
            
            // Handle wrapping (assuming normalized 0-1 coordinates)
            if (Math.abs(dx) > 0.5) dx = dx > 0 ? dx - 1 : dx + 1;
            if (Math.abs(dy) > 0.5) dy = dy > 0 ? dy - 1 : dy + 1;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            const interactionRadius = (blobA.currentSize + blobB.currentSize) * 0.7;
            
            // If blobs are close enough to interact
            if (distance < interactionRadius) {
                // Apply forces based on distance
                const strength = (1 - distance / interactionRadius) * 0.1;
                const angle = Math.atan2(dy, dx);
                
                // Push blobs apart
                blobA.vx -= Math.cos(angle) * strength * dt;
                blobA.vy -= Math.sin(angle) * strength * dt;
                blobB.vx += Math.cos(angle) * strength * dt;
                blobB.vy += Math.sin(angle) * strength * dt;
                
                // Color blending when very close
                if (distance < interactionRadius * 0.5) {
                    // Blend colors slightly
                    const blendFactor = 0.05 * dt * (1 - distance / (interactionRadius * 0.5));
                    
                    // Average the hues (being careful with the circular nature of hue)
                    const hueDiff = ((blobB.hue - blobA.hue + 540) % 360) - 180;
                    blobA.hue = (blobA.hue + hueDiff * blendFactor + 360) % 360;
                    blobB.hue = (blobB.hue - hueDiff * blendFactor + 360) % 360;
                    
                    // Blend saturation and lightness
                    const satDiff = blobB.saturation - blobA.saturation;
                    const lightDiff = blobB.lightness - blobA.lightness;
                    
                    blobA.saturation += satDiff * blendFactor;
                    blobB.saturation -= satDiff * blendFactor;
                    blobA.lightness += lightDiff * blendFactor;
                    blobB.lightness -= lightDiff * blendFactor;
                }
            }
        }
    }
}

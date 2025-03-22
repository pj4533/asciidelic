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
    
    // Apply blob interactions - pass the blobSystem for splitting and merging
    applyBlobInteractions(blobs, dt, time, blobSystem);
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
function applyBuoyancy(blob, dt, time) {
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

/**
 * Update blob shape by morphing its vertices
 * @param {Object} blob - The blob to update
 * @param {number} time - Current time
 * @param {number} dt - Delta time
 */
function updateBlobShape(blob, time, dt) {
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

/**
 * Update blob color over time - significantly enhanced color dynamics
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
        
        // Add position and time-based variation for more dynamic color shifting
        const positionShift = Math.sin(nx * 7 + ny * 5 + time * 0.5) * 15;  // Stronger position shift
        const adaptiveHue = (baseHue + positionShift) % 360;
        
        // Calculate how far blob's hue is from the target
        const currentHueDiff = ((blob.hue - adaptiveHue + 540) % 360) - 180;
        
        // Much more aggressive hue adaptation - roughly 3x faster
        if (Math.abs(currentHueDiff) > 20) {  // Reduced tolerance threshold
            // Faster convergence to target color
            blob.hue = (blob.hue + (adaptiveHue - blob.hue) * 0.06 * dt) % 360;  // 3x faster adaptation
            if (blob.hue < 0) blob.hue += 360;
        } else {
            // Otherwise apply larger hue shift over time (2x previous value)
            blob.hue += blob.hueShift * 2 * dt;
            if (blob.hue > 360) blob.hue -= 360;
            if (blob.hue < 0) blob.hue += 360;
        }
        
        // More vibrant color targets from color manager
        blob.targetSaturation = Math.min(100, colorManager.saturation * (0.9 + random(0, 0.2)));
        blob.targetLightness = Math.min(90, Math.max(50, colorManager.lightness * (0.9 + random(0, 0.3))));
        
        // Apply oscillating saturation and lightness effects
        const pulseRate = 0.8; // Faster pulsing
        const saturationPulse = Math.sin(time * pulseRate + blob.id * 3) * 10;
        const lightnessPulse = Math.cos(time * pulseRate + blob.id * 5) * 10;
        
        blob.targetSaturation = Math.min(100, Math.max(80, blob.targetSaturation + saturationPulse));
        blob.targetLightness = Math.min(90, Math.max(60, blob.targetLightness + lightnessPulse));
    } else {
        // Original behavior if no color manager but with faster shifts
        blob.hue += blob.hueShift * 2 * dt; // Double the shift rate
        if (blob.hue > 360) blob.hue -= 360;
        if (blob.hue < 0) blob.hue += 360;
        
        // More frequent adjustments to saturation and lightness targets
        if (Math.random() < 0.02) { // 4x more frequent
            blob.targetSaturation = random(80, 100);
            blob.targetLightness = random(60, 85);
        }
    }
    
    // More frequent and stronger hue shift changes
    if (Math.random() < 0.01) { // More frequent changes
        blob.hueShift = random(-8, 8); // Much larger range - almost 3x
    }
    
    // Move current values toward targets MUCH faster
    blob.saturation = lerp(blob.saturation, blob.targetSaturation, 0.15 * dt); // 3x faster
    blob.lightness = lerp(blob.lightness, blob.targetLightness, 0.15 * dt); // 3x faster
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
 * Apply interactions between blobs including splitting and merging
 * @param {Array} blobs - Array of all blobs
 * @param {number} dt - Delta time
 * @param {number} time - Current time
 * @param {Object} blobSystem - The blob system
 */
function applyBlobInteractions(blobs, dt, time, blobSystem) {
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
            
            // Add velocity in opposite directions
            const splitVelocity = 0.05 + Math.random() * 0.05;
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
            
            // Calculate distance with wrapping
            let dx = blobB.x - blobA.x;
            let dy = blobB.y - blobA.y;
            
            // Handle wrapping (assuming normalized 0-1 coordinates)
            if (Math.abs(dx) > 0.5) dx = dx > 0 ? dx - 1 : dx + 1;
            if (Math.abs(dy) > 0.5) dy = dy > 0 ? dy - 1 : dy + 1;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
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
                const angle = Math.atan2(dy, dx);
                
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
                    
                    // Blend saturation and lightness
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
function createSplitBlob(parentBlob, size, x, y, time) {
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
        lifespan: parentBlob.lifespan * (0.7 + random(0, 0.6)), // Slightly shorter lifespan
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
function createMergedBlob(blobA, blobB, time) {
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
    
    // Average lifespan, but gain a little extra time from merging
    const avgLifespan = (blobA.lifespan + blobB.lifespan) * 0.5;
    const avgAge = (blobA.age + blobB.age) * 0.5;
    const extraLifespan = 5 + random(0, 10); // Bonus time from merging
    
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

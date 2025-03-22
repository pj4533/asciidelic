/**
 * Spawn physics module for lava lamp blobs
 * Handles blob creation and initialization
 */
import { random } from '../../../../utils/math.js';

/**
 * Spawn new blobs if needed
 * @param {Object} blobSystem - The blob system
 * @param {number} time - Current time
 */
export function spawnNewBlobs(blobSystem, time) {
    const { blobs, maxBlobs, lastSpawnTime, colorManager } = blobSystem;
    
    // Initial blob generation - ensure we have a minimal starting population
    if (blobs.length < 5) {  // Reduced initial population from 10 to 5
        // Create multiple blobs at once for initial population
        const numToCreate = 5 - blobs.length;
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
export function createBlob(time, colorManager) {
    // Base properties
    const size = random(0.08, 0.25); // Reduced size range for less screen coverage
    const lifespan = random(15, 25); // Significantly shorter lifespan to prevent accumulation
    
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
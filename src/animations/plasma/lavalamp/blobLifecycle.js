/**
 * Blob lifecycle management for lava lamp animation
 */

/**
 * Create a blob system that manages blob creation and lifetime
 * @returns {Object} Blob system with configuration and state
 */
export function createBlobSystem() {
    return {
        blobs: [], // Array of active blobs
        maxBlobs: 25, // Maximum number of blobs (increased from 12)
        lastSpawnTime: 0, // Time of last spawn
        spawnInterval: 0.5, // Seconds between spawns (reduced from 2)
        time: 0 // Current time
    };
}

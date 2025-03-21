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
        maxBlobs: 12, // Maximum number of blobs
        lastSpawnTime: 0, // Time of last spawn
        spawnInterval: 2, // Seconds between spawns
        time: 0 // Current time
    };
}

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
        maxBlobs: 30, // Maximum number of blobs - will be adjusted by density
        lastSpawnTime: 0, // Time of last spawn
        spawnInterval: 0.4, // Seconds between spawns - will be adjusted by density
        time: 0, // Current time
        density: 0.6, // Stored density value
        lastDensityUpdate: 0, // Time of last density parameter change
        lastSplitTime: 0, // Last time a blob was split
        lastMergeTime: 0, // Last time blobs were merged
        lastSizeChangeTime: 0, // Last time a blob size was changed
        splitInterval: 0.8, // Seconds between potential blob splits (much more frequent)
        mergeInterval: 1.2, // Seconds between potential blob merges (much more frequent)
        sizeChangeInterval: 1.5, // Seconds between potential blob size changes (much more frequent)
        actionVariance: 0.4 // Random variance applied to timing (slightly increased)
    };
}

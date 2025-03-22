/**
 * Physics module index for lava lamp animation
 * Re-exports all physics functions from sub-modules
 */

// Main physics engine
export { applyPhysics } from './basePhysics.js';

// Sub-modules (exported for direct access if needed)
export { applyFlowForces, applyBuoyancy } from './motionPhysics.js';
export { updateBlobShape } from './shapePhysics.js';
export { updateBlobColor } from './colorPhysics.js';
export { spawnNewBlobs, createBlob } from './spawnPhysics.js';
export { 
    applyBlobInteractions, 
    createSplitBlob, 
    createMergedBlob 
} from './interactionPhysics.js';
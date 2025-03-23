/**
 * Animation Registry - Centralized registry of all available animations
 */

// Import animations
import { plasmaAnimation } from './plasma.js';
import { cellularAnimation } from './plasma/cellular/index.js';
import { lavaLampAnimation } from './plasma/lavalamp/index.js';
import { flowFieldAnimation } from './plasma/flowfield.js';
import { nebulaAnimation } from './plasma/nebula.js';
import { noiseCloudAnimation } from './plasma/noisecloud.js';

// Create animation registry with metadata
const animations = [
    {
        id: 'lavalamp',
        name: 'Lava Lamp',
        fn: lavaLampAnimation,
        description: 'Fluid-like blobs that morph, split, and combine'
    },
    {
        id: 'plasma',
        name: 'Plasma',
        fn: plasmaAnimation,
        description: 'Smooth plasma-like distortion fields'
    },
    {
        id: 'nebula',
        name: 'Nebula',
        fn: nebulaAnimation,
        description: 'Cosmic gas cloud formations'
    },
    {
        id: 'flowfield',
        name: 'Flow Field',
        fn: flowFieldAnimation,
        description: 'Particles following dynamic vector fields'
    },
    {
        id: 'cellular',
        name: 'Cellular',
        fn: cellularAnimation,
        description: 'Cell-like structures that grow and interact'
    },
    {
        id: 'noisecloud',
        name: 'Noise Cloud',
        fn: noiseCloudAnimation,
        description: 'Cloud-like formations based on noise'
    }
];

// Export the animations array
export { animations };

// Default animation
export const DEFAULT_ANIMATION = 'lavalamp';
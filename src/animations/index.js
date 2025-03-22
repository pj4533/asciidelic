/**
 * Animation registry - Exports all available animations
 */
import { plasmaAnimation } from './plasma.js';
import { nebulaAnimation } from './plasma/nebula.js';
import { flowFieldAnimation } from './plasma/flowfield.js';
import { cellularAnimation } from './plasma/cellular.js';
import { lavaLampAnimation } from './plasma/lavalamp.js';
import { noiseCloudAnimation } from './plasma/noisecloud.js';

// Export all animations
export {
    plasmaAnimation,
    nebulaAnimation,
    flowFieldAnimation,
    cellularAnimation,
    lavaLampAnimation,
    noiseCloudAnimation
};

// Export named animations with metadata
export const animations = [
    {
        id: 'lavalamp',
        name: 'Lava Lamp',
        fn: lavaLampAnimation,
        description: 'Dynamic metaballs that morph and interact fluidly'
    },
    {
        id: 'plasma',
        name: 'Plasma',
        fn: plasmaAnimation,
        description: 'A plasma-like effect with flowing patterns'
    },
    {
        id: 'nebula',
        name: 'Nebula',
        fn: nebulaAnimation,
        description: 'Ethereal cosmic cloud formations that slowly transform'
    },
    {
        id: 'flowfield', 
        name: 'Flow Field',
        fn: flowFieldAnimation,
        description: 'Currents and streams flowing in a dynamic fluid pattern'
    },
    {
        id: 'cellular',
        name: 'Cellular',
        fn: cellularAnimation,
        description: 'Organic cell-like structures that grow and evolve'
    },
    {
        id: 'noisecloud',
        name: 'Cloud Formations',
        fn: noiseCloudAnimation,
        description: 'Billowing clouds that drift and change shape'
    }
];
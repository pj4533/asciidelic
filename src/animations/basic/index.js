/**
 * Basic Animations Module - Entry point for basic animation types
 */

import { waveAnimation } from './waves.js';
import { spiralAnimation } from './spiral.js';
import { classicTunnelAnimation } from './tunnel.js';
import { plasmaAnimation } from './plasma.js';
import { mandalaAnimation } from './mandala.js';
import { vortexTunnelAnimation } from './vortex.js';
import { wormholeAnimation } from './wormhole.js';

// Export all animations
export {
    waveAnimation,
    spiralAnimation,
    classicTunnelAnimation,
    plasmaAnimation,
    mandalaAnimation,
    vortexTunnelAnimation,
    wormholeAnimation
};

// Animation registry with metadata
export const basicAnimations = [
    {
        id: 'waves',
        name: 'Waves',
        function: waveAnimation,
        description: 'Concentric circular waves emanating from the center'
    },
    {
        id: 'spiral',
        name: 'Spiral',
        function: spiralAnimation,
        description: 'Spiraling patterns with angular momentum'
    },
    {
        id: 'classicTunnel',
        name: 'Classic Tunnel',
        function: classicTunnelAnimation,
        description: 'Traditional tunnel effect with zooming rings'
    },
    {
        id: 'plasma',
        name: 'Plasma',
        function: plasmaAnimation,
        description: 'Classic plasma field with sine wave interference'
    },
    {
        id: 'mandala',
        name: 'Mandala',
        function: mandalaAnimation,
        description: 'Circular patterns with radial symmetry'
    },
    {
        id: 'vortexTunnel',
        name: 'Vortex Tunnel',
        function: vortexTunnelAnimation,
        description: 'Spinning tunnel with detailed walls and rotation'
    },
    {
        id: 'wormhole',
        name: 'Wormhole',
        function: wormholeAnimation,
        description: 'Dynamic wormhole with oscillating walls'
    }
];
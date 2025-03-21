/**
 * Animation registry - Exports all available animations
 */
import { waveAnimation } from './waves.js';
import { spiralAnimation } from './spiral.js';
import { tunnelAnimation } from './tunnels/classic.js';
import { vortexTunnelAnimation } from './tunnels/vortex.js';
import { wormholeAnimation } from './tunnels/wormhole.js';
import { plasmaAnimation } from './plasma.js';
import { mandalaAnimation } from './mandala.js';

// Export all animations
export {
    waveAnimation,
    spiralAnimation,
    tunnelAnimation,
    vortexTunnelAnimation,
    wormholeAnimation,
    plasmaAnimation,
    mandalaAnimation
};

// Export named animations with metadata
export const animations = [
    {
        id: 'waves',
        name: 'Waves',
        fn: waveAnimation,
        description: 'Concentric wave patterns that ripple outward'
    },
    {
        id: 'spiral',
        name: 'Spiral',
        fn: spiralAnimation,
        description: 'Spiral patterns that rotate around the center'
    },
    {
        id: 'tunnel',
        name: 'Classic Tunnel',
        fn: tunnelAnimation,
        description: 'A classic tunnel effect with zooming rings'
    },
    {
        id: 'plasma',
        name: 'Plasma',
        fn: plasmaAnimation,
        description: 'A plasma-like effect with flowing patterns'
    },
    {
        id: 'mandala',
        name: 'Mandala',
        fn: mandalaAnimation,
        description: 'Circular patterns that form mandala-like designs'
    },
    {
        id: 'vortexTunnel',
        name: 'Vortex Tunnel',
        fn: vortexTunnelAnimation,
        description: 'A tunnel with rotating vortex effects'
    },
    {
        id: 'wormhole',
        name: 'Wormhole',
        fn: wormholeAnimation,
        description: 'A wormhole with oscillating tunnel walls'
    }
];
/**
 * Default configuration settings for AsciiDelic
 */
export const defaultConfig = {
    // Display settings
    width: 80,
    height: 40,
    animationSpeed: 60, // Frame rate in FPS
    
    // Mode settings
    isAutomatedMode: true, // false: manual, true: automated parameter changes
    
    // Animation control
    animationType: 0,
    speed: 1.0, // animation speed multiplier
    
    // Character appearance
    density: 0.6, // character density
    
    // Color settings
    colorMode: 0, // 0: rainbow, 1: monochrome, 2: complementary, 3: gradient
    baseHue: 180, // initial hue
    targetHue: 180, // for smooth transitions
    hueTransitionSpeed: 0.05,
    saturation: 100,
    lightness: 50,
    
    // Automated mode settings
    automationSpeed: 0.5, // How quickly parameters change in automated mode
    nextTransitionTime: 0, // When to change to the next parameter set
    transitionDuration: 5, // Seconds between parameter changes
};

/**
 * Character sets used in animations
 */
export const characterSets = {
    // Light dots and points
    dots: ['·', '∙', '•', '․', '⁘', '⁙', '⁚', '⋮', '⋯', '⋰', '⋱'],
    
    // Block elements with increasing density
    blocks: ['░', '▒', '▓', '█', '▄', '▀', '▌', '▐', '▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟'],
    
    // Box drawing elements
    boxDrawing: ['╭', '╮', '╯', '╰', '│', '─', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼', '╱', '╲', '╳'],
    
    // Stars, asterisks, sparks
    stars: ['✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮', '✯', '✱', '✲', '✳', '✴', '✵', '✶', '✷', '✸', '✹', '✺', '✻', '✼'],
    
    // Rounded elements and circles
    circles: ['◌', '○', '◎', '●', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◍', '◉', '⊙', '⊚', '⊛', '❀', '❁'],
    
    // Diamonds and geometric
    geometric: ['◇', '◈', '◆', '⟡', '⟢', '⟣', '⟤', '⟥', '⬖', '⬗', '⬘', '⬙', '⬠', '⬡'],
    
    // Ornate shapes and florals
    ornate: ['✿', '❀', '❁', '❂', '❃', '❇', '❈', '❉', '❊', '❋', '✽', '✾', '✿', '❆', '❅', '❄'],
    
    // Miscellaneous special symbols
    special: ['♦', '♠', '♣', '♥', '⁂', '※', '⌘', '⌥', '⌦', '⌫', '⏏', '⎔', '⎕', '⍯', '⟰', '⟱', '⟲', '⟳'],
    
    // Arrows and motion indicators
    arrows: ['↖', '↗', '↘', '↙', '↭', '↝', '↞', '↠', '↢', '↣', '↭', '↯', '↺', '↻', '⇄', '⇅', '⇆', '⇇', '⇈'],
    
    // Mathematical and currency
    math: ['∞', '∆', '∇', '∂', '∀', '∃', '∄', '∑', '∏', '∐'],
    
    // Wave/ripple like
    waves: ['∿', '≈', '≋', '≣', '≡', '≢'],
};

/**
 * Returns a flattened array of all available characters
 */
export function getAllCharacters() {
    return Object.values(characterSets).flat();
}

/**
 * Animation definitions
 */
export const animations = [
    {
        id: 'waves',
        name: 'Waves',
        description: 'Concentric wave patterns that ripple outward',
    },
    {
        id: 'spiral',
        name: 'Spiral',
        description: 'Spiral patterns that rotate around the center',
    },
    {
        id: 'classicTunnel',
        name: 'Classic Tunnel',
        description: 'A classic tunnel effect with zooming rings',
    },
    {
        id: 'plasma',
        name: 'Plasma',
        description: 'A plasma-like effect with flowing patterns',
    },
    {
        id: 'mandala',
        name: 'Mandala',
        description: 'Circular patterns that form mandala-like designs',
    },
    {
        id: 'vortexTunnel',
        name: 'Vortex Tunnel',
        description: 'A tunnel with rotating vortex effects',
    },
    {
        id: 'wormhole',
        name: 'Wormhole',
        description: 'A wormhole with oscillating tunnel walls',
    }
];

/**
 * Color modes
 */
export const colorModes = [
    {
        id: 'rainbow',
        name: 'Rainbow',
        description: 'Full spectrum color cycling'
    },
    {
        id: 'monochrome',
        name: 'Monochrome',
        description: 'Single color with variations'
    },
    {
        id: 'complementary',
        name: 'Complementary',
        description: 'Two colors opposite on the color wheel'
    },
    {
        id: 'gradient',
        name: 'Gradient',
        description: 'Smooth gradient between related colors'
    }
];
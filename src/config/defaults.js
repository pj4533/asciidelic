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
 * Default animation - the ID of the animation to show on startup
 */
export const DEFAULT_ANIMATION = 'plasma';

/**
 * Default initial config values
 */
export const initialConfig = {
    animationId: DEFAULT_ANIMATION,  // ID of the initial animation to show
};

/**
 * Color modes
 */
export const colorModes = [
    {
        id: 'vibrantRainbow',
        name: 'Vibrant Rainbow',
        description: 'Full spectrum with dynamic variations'
    },
    {
        id: 'multiGradient',
        name: 'Multi-Color',
        description: 'Wide gradient with time effects'
    },
    {
        id: 'triadic',
        name: 'Triadic',
        description: 'Three evenly spaced colors'
    },
    {
        id: 'colorWave',
        name: 'Color Wave',
        description: 'Undulating wave of vibrant colors'
    }
];
/**
 * Color Manager - Handles color calculations for animations
 */

export class ColorManager {
    /**
     * Create a new color manager
     * @param {Object} config - Animation configuration
     */
    constructor(config) {
        this.config = config;
        this.saturation = config.saturation || 100;
    }

    /**
     * Update configuration
     * @param {Object} newConfig - Updated configuration
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.saturation = this.config.saturation;
    }

    /**
     * Calculate hue based on color mode and position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} distance - Distance value (e.g. from center)
     * @param {number} value - Normalized animation value (0-1)
     * @param {number} time - Current time in seconds
     * @returns {number} Hue value (0-360)
     */
    getHue(x, y, distance, value, time) {
        // Ensure we're working with current config values
        const baseHue = this.config.baseHue;
        const colorMode = this.config.colorMode;
        
        switch(colorMode) {
            case 0: // Rainbow - full spectrum
                return (baseHue + distance * 5 + time * 10) % 360;
            case 1: // Monochrome - variations on base hue
                return baseHue;
            case 2: // Complementary - base hue and opposite
                return value > 0.5 ? baseHue : (baseHue + 180) % 360;
            case 3: // Gradient between two hues
                return baseHue + value * 60; // 60 degree spread
            default:
                return baseHue;
        }
    }
}
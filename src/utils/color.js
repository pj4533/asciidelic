/**
 * Color.js - Color utility functions and color management
 */
export class ColorManager {
    /**
     * Create a new color manager
     * @param {Object} config - Color configuration
     */
    constructor(config) {
        this.baseHue = config.baseHue || 180;
        this.targetHue = config.targetHue || 180;
        this.hueTransitionSpeed = config.hueTransitionSpeed || 0.05;
        this.colorMode = config.colorMode || 0;
        this.saturation = config.saturation || 100;
        this.lightness = config.lightness || 50;
    }

    /**
     * Update color configuration
     * @param {Object} config - New configuration
     */
    updateConfig(config) {
        if (config.targetHue !== undefined) {
            this.targetHue = config.targetHue;
        }
        if (config.hueTransitionSpeed !== undefined) {
            this.hueTransitionSpeed = config.hueTransitionSpeed;
        }
        if (config.colorMode !== undefined) {
            this.colorMode = config.colorMode;
        }
        if (config.saturation !== undefined) {
            this.saturation = config.saturation;
        }
        if (config.lightness !== undefined) {
            this.lightness = config.lightness;
        }
    }

    /**
     * Update color state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        // Smoothly transition between target and current hue
        if (this.baseHue !== this.targetHue) {
            const step = this.hueTransitionSpeed;
            if (Math.abs(this.baseHue - this.targetHue) < step) {
                this.baseHue = this.targetHue;
            } else if (this.baseHue < this.targetHue) {
                this.baseHue += step;
            } else {
                this.baseHue -= step;
            }
        }
    }

    /**
     * Calculate hue based on color mode and parameters
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} distance - Distance from center
     * @param {number} value - Value between 0 and 1
     * @param {number} time - Current time
     * @returns {number} Calculated hue (0-360)
     */
    getHue(x, y, distance, value, time = 0) {
        switch(this.colorMode) {
            case 0: // Rainbow - full spectrum
                return (this.baseHue + distance * 5 + time * 10) % 360;
            case 1: // Monochrome - variations on base hue
                return this.baseHue;
            case 2: // Complementary - base hue and opposite
                return value > 0.5 ? this.baseHue : (this.baseHue + 180) % 360;
            case 3: // Gradient between two hues
                return this.baseHue + value * 60; // 60 degree spread
            default:
                return this.baseHue;
        }
    }

    /**
     * Get color as HSL string
     * @param {number} hue - Hue (0-360)
     * @param {number} saturation - Saturation (0-100)
     * @param {number} lightness - Lightness (0-100)
     * @returns {string} HSL color string
     */
    getHslString(hue, saturation = this.saturation, lightness = this.lightness) {
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    /**
     * Create a color object
     * @param {number} hue - Hue (0-360)
     * @param {number} saturation - Saturation (0-100)
     * @param {number} lightness - Lightness (0-100)
     * @returns {Object} Color object
     */
    createColor(hue, saturation = this.saturation, lightness = this.lightness) {
        return { hue, saturation, lightness };
    }
}
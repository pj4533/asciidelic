/**
 * Math.js - Mathematical utility functions for animations
 */

/**
 * Map a value from one range to another
 * @param {number} value - Value to map
 * @param {number} inMin - Input minimum
 * @param {number} inMax - Input maximum
 * @param {number} outMin - Output minimum
 * @param {number} outMax - Output maximum
 * @returns {number} Mapped value
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Calculate distance between two points
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} Distance between points
 */
export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radToDeg(radians) {
    return radians * 180 / Math.PI;
}

/**
 * Generate a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Smooth step function
 * @param {number} t - Input value (0-1)
 * @returns {number} Smoothed value
 */
export function smoothStep(t) {
    return t * t * (3 - 2 * t);
}

/**
 * Smoother step function
 * @param {number} t - Input value (0-1)
 * @returns {number} Smoothed value
 */
export function smootherStep(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Oscillate between 0 and 1 over time
 * @param {number} time - Current time
 * @param {number} frequency - Oscillation frequency
 * @returns {number} Value between 0 and 1
 */
export function oscillate(time, frequency = 1) {
    return (Math.sin(time * frequency * Math.PI * 2) + 1) / 2;
}
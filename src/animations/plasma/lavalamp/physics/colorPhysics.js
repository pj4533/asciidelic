/**
 * Color physics module for lava lamp blobs
 * Handles color transitions, animations, and plasma-style colorization
 */
import { random, lerp } from '../../../../utils/math.js';

/**
 * Update blob color over time
 * @param {Object} blob - The blob to update
 * @param {number} time - Current time
 * @param {number} dt - Delta time
 */
export function updateBlobColor(blob, time, dt) {
    // Get color manager from blob system if we're in a system context
    const colorManager = blob.system?.colorManager;
    
    if (colorManager) {
        // Adjust target colors to stay in theme with color manager
        const nx = blob.x;
        const ny = blob.y;
        const distance = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 2;
        const value = blob.age / blob.lifespan; // Use life phase as a value parameter
        
        // Calculate base hue from color manager (respects color mode)
        const baseHue = colorManager.getHue(nx, ny, distance, value, time);
        
        // Add position and time-based variation for more dynamic color shifting
        const positionShift = Math.sin(nx * 7 + ny * 5 + time * 0.5) * 15;  // Stronger position shift
        const adaptiveHue = (baseHue + positionShift) % 360;
        
        // Calculate how far blob's hue is from the target
        const currentHueDiff = ((blob.hue - adaptiveHue + 540) % 360) - 180;
        
        // Much more aggressive hue adaptation - roughly 3x faster
        if (Math.abs(currentHueDiff) > 20) {  // Reduced tolerance threshold
            // Faster convergence to target color
            blob.hue = (blob.hue + (adaptiveHue - blob.hue) * 0.06 * dt) % 360;  // 3x faster adaptation
            if (blob.hue < 0) blob.hue += 360;
        } else {
            // Otherwise apply larger hue shift over time (2x previous value)
            blob.hue += blob.hueShift * 2 * dt;
            if (blob.hue > 360) blob.hue -= 360;
            if (blob.hue < 0) blob.hue += 360;
        }
        
        // Use saturation directly from colorManager - just like plasma does
        blob.targetSaturation = colorManager.saturation;
        
        // Calculate lightness like plasma does - 50 + value * 30
        // where value is the blob's life phase in this case
        blob.targetLightness = 50 + (blob.age / blob.lifespan) * 30;
        
        // Add subtle position-based variation to simulate plasma's spatial variation
        const gridX = blob.x * 20; // Scale to simulate grid coordinates
        const gridY = blob.y * 20;
        
        // Add very subtle oscillations - much less than before to respect colorManager more
        const pulseRate = 0.3; // Slower pulsing
        const lightnessPulse = Math.cos(time * pulseRate + gridX + gridY) * 5; // Much smaller variation
        
        // Apply the subtle pulse to lightness
        blob.targetLightness = Math.min(90, Math.max(40, blob.targetLightness + lightnessPulse));
    } else {
        // Original behavior if no color manager but with faster shifts
        blob.hue += blob.hueShift * 2 * dt; // Double the shift rate
        if (blob.hue > 360) blob.hue -= 360;
        if (blob.hue < 0) blob.hue += 360;
        
        // More frequent adjustments to saturation and lightness targets
        if (Math.random() < 0.02) { // 4x more frequent
            blob.targetSaturation = random(80, 100);
            blob.targetLightness = random(60, 85);
        }
    }
    
    // More frequent and stronger hue shift changes
    if (Math.random() < 0.01) { // More frequent changes
        blob.hueShift = random(-8, 8); // Much larger range - almost 3x
    }
    
    // Move current values toward targets MUCH faster
    blob.saturation = lerp(blob.saturation, blob.targetSaturation, 0.15 * dt); // 3x faster
    blob.lightness = lerp(blob.lightness, blob.targetLightness, 0.15 * dt); // 3x faster
}
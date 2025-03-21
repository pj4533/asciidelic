/**
 * Lava Lamp Animation - Realistic flowing wax blobs with physics-inspired behavior
 */

/**
 * Create a lava lamp animation
 * @param {CharacterGrid} grid - The character grid
 * @param {number} time - Current time in seconds
 * @param {number} deltaTime - Time since last update in seconds
 * @param {Object} config - Configuration options
 * @param {Array} characters - Available characters
 * @param {ColorManager} colorManager - Color manager
 */
export function lavaLampAnimation(grid, time, deltaTime, config, characters, colorManager) {
    const width = grid.width;
    const height = grid.height;
    
    // Ultra slow time for lava lamp effect (even slower for more realism)
    const slowTime = time * 0.15 * config.speed;
    
    // Lamp container parameters - create a container shape
    const containerWidth = width * 0.7; 
    const containerLeft = (width - containerWidth) / 2;
    const containerRight = containerLeft + containerWidth;
    const containerTop = height * 0.05;
    const containerBottom = height * 0.95;
    
    // Fluid dynamics parameters
    const gravity = 0.02 * config.speed;
    const buoyancy = 0.03 * config.speed;
    const heatVariation = Math.sin(slowTime * 0.3) * 0.01 + 0.01; // Simulates heating element
    
    // Flow currents - create a realistic central rising flow
    const getCurrent = (x, y) => {
        // Distance from center X
        const centerX = width / 2;
        const distFromCenter = Math.abs(x - centerX) / (width / 2);
        
        // Vertical position affects current
        const normalizedY = (y - containerTop) / (containerBottom - containerTop);
        
        // Central rising current (stronger in middle, changes over time)
        const centralCurrent = Math.max(0, 0.5 - distFromCenter) * Math.sin(normalizedY * Math.PI) * (0.02 + heatVariation);
        
        // Side falling currents (stronger at edges)
        const sideCurrent = -distFromCenter * 0.01 * (1 - Math.pow(normalizedY - 0.5, 2));
        
        return centralCurrent + sideCurrent;
    };
    
    // Blob simulation
    const maxBlobs = 8 + Math.floor(Math.sin(slowTime * 0.05) * 2);
    const minBlobSize = Math.min(width, height) * 0.08;
    const maxBlobSize = Math.min(width, height) * 0.22;
    
    // Blob lifecycle phases:
    // 1. Formation at bottom (growing)
    // 2. Rising (buoyant)
    // 3. Ceiling interaction (spreading)
    // 4. Descending (falling)
    // 5. Merging/splitting (blob interaction)
    const blobPhases = ['forming', 'rising', 'ceiling', 'descending', 'merging'];
    
    // Track active blobs
    const blobs = [];
    
    // Create blobs with varied properties
    for (let i = 0; i < maxBlobs; i++) {
        const seed = i * 1234.5678 + slowTime * 0.01;
        
        // Use i as a base for lifecycle timing to ensure blobs are at different phases
        const lifecycleOffset = (i / maxBlobs) * 10; // Spread blobs throughout lifecycle
        const lifecyclePosition = (slowTime * 0.1 + lifecycleOffset) % 10; // 0-10 lifecycle position
        
        // Determine blob phase based on lifecycle position
        let phase;
        let phaseProgress;
        
        if (lifecyclePosition < 1) {
            phase = 'forming';
            phaseProgress = lifecyclePosition; // 0-1
        } else if (lifecyclePosition < 5) {
            phase = 'rising';
            phaseProgress = (lifecyclePosition - 1) / 4; // 0-1
        } else if (lifecyclePosition < 6) {
            phase = 'ceiling';
            phaseProgress = lifecyclePosition - 5; // 0-1
        } else if (lifecyclePosition < 9) {
            phase = 'descending';
            phaseProgress = (lifecyclePosition - 6) / 3; // 0-1
        } else {
            phase = 'merging';
            phaseProgress = lifecyclePosition - 9; // 0-1
        }
        
        // Base position determined by phase
        let x, y, size, stretch, wobble, opacity;
        
        // Distinct behavior for each phase
        switch (phase) {
            case 'forming':
                // Form at the bottom, growing in size
                x = containerLeft + containerWidth * (0.3 + Math.sin(seed) * 0.4);
                y = containerBottom - containerWidth * 0.1;
                // Start small and grow
                size = minBlobSize + (maxBlobSize - minBlobSize) * phaseProgress;
                stretch = 0.8 + phaseProgress * 0.3; // Stretch upward as it forms
                wobble = 0.2 * phaseProgress; // Starts stable, begins to wobble
                opacity = 0.3 + phaseProgress * 0.7; // Fade in
                break;
                
            case 'rising':
                // Rise up with wobbling motion
                x = containerLeft + containerWidth * (0.3 + Math.sin(seed) * 0.4);
                x += Math.sin(slowTime * 0.3 + seed) * (10 * phaseProgress); // Wobble more as it rises
                // Move from bottom to top
                y = containerBottom - (containerBottom - containerTop) * 0.3 - 
                    (containerBottom - containerTop) * 0.6 * phaseProgress;
                // Full size with slight pulsing
                size = maxBlobSize * (0.9 + Math.sin(slowTime * 0.5 + seed) * 0.1);
                // Stretch changes with movement - elongated while moving fast
                stretch = 1.2 - 0.4 * Math.sin(phaseProgress * Math.PI);
                wobble = 0.6; // Maximum wobble during rise
                opacity = 1.0; // Fully visible
                break;
                
            case 'ceiling':
                // Spread out against the ceiling
                const spreadCenter = containerLeft + containerWidth * (0.3 + Math.sin(seed) * 0.3);
                x = spreadCenter;
                y = containerTop + containerWidth * 0.12;
                // Spread and flatten against ceiling
                size = maxBlobSize * (1.1 + phaseProgress * 0.3);
                stretch = 0.5 - phaseProgress * 0.2; // Flatten horizontally
                wobble = 0.2; // Less wobble when compressed
                opacity = 1.0;
                break;
                
            case 'descending':
                // Fall down along the sides
                const side = Math.sign(Math.sin(seed)); // -1 or 1 for left/right side
                const sideDistance = 0.35 + Math.sin(seed * 3) * 0.1; // Vary the side distance
                x = containerLeft + containerWidth * (0.5 + side * sideDistance);
                x += Math.sin(slowTime * 0.2 + seed) * 5; // Slight wobble
                // Move from top to bottom
                y = containerTop + (containerBottom - containerTop) * 0.2 + 
                    (containerBottom - containerTop) * 0.6 * phaseProgress;
                size = maxBlobSize * (0.8 + Math.sin(slowTime * 0.4 + seed) * 0.1);
                // Stretch changes with movement - elongated while moving fast
                stretch = 1.3 - 0.2 * Math.cos(phaseProgress * Math.PI);
                wobble = 0.3; // Moderate wobble during descent
                opacity = 0.9; // Slightly less visible
                break;
                
            case 'merging':
                // Move toward the center bottom for merging
                x = containerLeft + containerWidth * (0.5 + Math.sin(seed) * 0.2);
                y = containerBottom - containerWidth * 0.15;
                // Shrink as it prepares to merge with forming blob
                size = maxBlobSize * (0.8 - phaseProgress * 0.5);
                stretch = 0.7 + phaseProgress * 0.2; // Change shape during merge
                wobble = 0.1 + phaseProgress * 0.2; // Increase wobble as it merges
                opacity = 0.9 - phaseProgress * 0.6; // Fade out as it merges
                break;
                
            default:
                // Fallback
                x = width / 2;
                y = height / 2;
                size = maxBlobSize;
                stretch = 1.0;
                wobble = 0.3;
                opacity = 1.0;
        }
        
        // Apply current effects
        if (phase === 'rising' || phase === 'descending') {
            // Apply fluid currents when in motion
            x += getCurrent(x, y) * 100 * deltaTime;
        }
        
        // Unique characteristics for each blob
        const colorOffset = (i / maxBlobs) * 360; // Ensure color variation
        const blobTemperature = 0.3 + Math.sin(seed * 7.5) * 0.2; // Some blobs hotter than others
        
        blobs.push({ 
            x, y, size, stretch, seed, phase, phaseProgress, 
            wobble, opacity, colorOffset, blobTemperature
        });
    }
    
    // Lamp body parameters - for creating the glass container look
    const glassThickness = 2; // Thickness of lamp container
    
    // Lava characters - different sets for different parts
    const bgChars = [' ', '.', '·', ':', '·'];
    const glassChars = ['│', '║', '┃', '┆', '┇', '┊', '┋', '╎', '╏', '┴', '┬', '╷', '╶', '╴']; // Vertical borders
    const lavaChars = [
        // Core blob characters (dense, rounded)
        '●', '◎', '◉', '⦿', '◍', '◌', '◯', '⚪', '⚫',
        // Medium density chars
        '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◴', '◵', '◶', '◷',
        // Lowest density/edge chars
        '○', '◌', '◯', '◠', '◡', '◜', '◝', '◞', '◟', '◚', '◛'
    ];
    const bubbleChars = ['°', '•', '∘', '∙', '⊙', '⊚', '◦', '⊖', '⊗', '⊘', '⦂'];
    
    // Render the lamp
    grid.forEach((x, y, cell) => {
        // Check if in lamp container
        const inContainer = x >= containerLeft && x <= containerRight && 
                          y >= containerTop && y <= containerBottom;
        
        // Check if on glass edge
        const onGlassEdge = 
            (Math.abs(x - containerLeft) <= glassThickness || Math.abs(x - containerRight) <= glassThickness) ||
            (Math.abs(y - containerTop) <= glassThickness || Math.abs(y - containerBottom) <= glassThickness);
        
        // Check for cap
        const inCap = x >= containerLeft && x <= containerRight && 
                    ((y >= containerTop - 3 && y < containerTop) || 
                     (y > containerBottom && y <= containerBottom + 3));
        
        // Calculate blob influence at this point
        let nearestBlobDist = Infinity;
        let nearestBlobPhase = null;
        let totalInfluence = 0;
        let maxInfluence = 0;
        let blobHue = 0;
        let blobTemp = 0;
        
        // Find nearest blob and calculate total influence
        for (const blob of blobs) {
            // Apply wobble effect to position
            const wobbleX = blob.wobble * Math.sin(slowTime * 0.7 + blob.seed * 3) * blob.size * 0.3;
            const wobbleY = blob.wobble * Math.sin(slowTime * 0.5 + blob.seed * 5) * blob.size * 0.2;
            
            // Calculate distance to wobbling blob with stretch factor
            const dx = (x - (blob.x + wobbleX)) / blob.stretch;
            const dy = (y - (blob.y + wobbleY)) * blob.stretch;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Track nearest blob
            if (distance < nearestBlobDist) {
                nearestBlobDist = distance;
                nearestBlobPhase = blob.phase;
                blobHue = blob.colorOffset;
                blobTemp = blob.blobTemperature;
            }
            
            // Blob field strength with varied falloff based on phase
            let falloff = 0.8;
            if (blob.phase === 'ceiling') falloff = 0.5; // Sharper edges when compressed
            if (blob.phase === 'forming') falloff = 1.2; // Softer edges when forming
            
            // Calculate influence with proper falloff
            const blobField = Math.max(0, 1 - (distance / (blob.size * falloff)));
            // Use higher powers for sharper edges
            const influence = Math.pow(blobField, 3) * blob.opacity;
            
            totalInfluence += influence;
            maxInfluence = Math.max(maxInfluence, influence);
        }
        
        // Normalize to [0,1] range
        const normalizedValue = Math.min(1, totalInfluence);
        
        // Add flowing patterns inside the blobs
        const flowPattern = Math.sin((x * 0.2) + (y * 0.3) + slowTime * 0.2) * 0.5 + 0.5;
        const flowPattern2 = Math.cos((x * 0.3) - (y * 0.2) + slowTime * 0.15) * 0.5 + 0.5;
        
        // Combine influences with flow pattern
        const combinedPattern = normalizedValue * 0.7 + (flowPattern * flowPattern2 * normalizedValue) * 0.3;
        
        // Add bubble effects occasionally
        const bubbleProbability = normalizedValue * 0.15 * heatVariation * 10;
        const isBubble = inContainer && Math.random() < bubbleProbability && normalizedValue > 0.3;
        
        // Determine what to draw at this position
        let charIndex;
        let hue, saturation, lightness;
        
        // Default - outside the lamp
        if (!inContainer && !inCap) {
            charIndex = Math.floor(Math.random() * bgChars.length);
            const bgChar = bgChars[charIndex];
            hue = colorManager.getHue(x, y, 0, 0.5, time);
            saturation = 10;
            lightness = 10 + Math.random() * 5;
            
            grid.setCell(x, y, {
                character: bgChar,
                hue,
                saturation,
                lightness
            });
            return;
        }
        
        // Glass container edges
        if (onGlassEdge || inCap) {
            // Choose appropriate glass character based on position
            let glassChar;
            
            if (Math.abs(x - containerLeft) <= glassThickness) {
                // Left edge
                glassChar = glassChars[0];
            } else if (Math.abs(x - containerRight) <= glassThickness) {
                // Right edge
                glassChar = glassChars[0];
            } else if (Math.abs(y - containerTop) <= glassThickness || inCap && y < containerTop) {
                // Top edge
                glassChar = '-';
            } else if (Math.abs(y - containerBottom) <= glassThickness || inCap && y > containerBottom) {
                // Bottom edge
                glassChar = '-';
            } else {
                // Default glass character
                glassChar = glassChars[Math.floor(Math.random() * glassChars.length)];
            }
            
            // Glass color - slight tint based on nearby lava
            hue = colorManager.getHue(x, y, 0, 0.1, time);
            saturation = 10 + normalizedValue * 10;
            lightness = 60 + normalizedValue * 20;
            
            grid.setCell(x, y, {
                character: glassChar,
                hue,
                saturation,
                lightness
            });
            return;
        }
        
        // Inside the lamp
        if (isBubble) {
            // Draw a bubble
            charIndex = Math.floor(Math.random() * bubbleChars.length);
            
            // Bubble colors are bright/white
            hue = colorManager.getHue(x, y, 0, 0.5, time);
            saturation = 10;
            lightness = 80 + Math.random() * 20;
            
            grid.setCell(x, y, {
                character: bubbleChars[charIndex],
                hue,
                saturation,
                lightness
            });
            return;
        }
        
        // Draw the lava/liquid
        if (normalizedValue > 0.05) {
            // We have some blob influence, draw lava
            
            // Choose character based on influence level - creates nice variation
            let charSetIndex;
            if (normalizedValue < 0.4) {
                // Blob edges (lowest density)
                charSetIndex = Math.floor(flowPattern * 11) + 20;
            } else if (normalizedValue < 0.8) {
                // Blob mid-density
                charSetIndex = Math.floor(flowPattern * 12) + 8;
            } else {
                // Blob core (densest)
                charSetIndex = Math.floor(flowPattern * 8);
            }
            
            // Ensure in bounds
            charSetIndex = Math.min(charSetIndex, lavaChars.length - 1);
            
            // Get base hue from color manager, then apply blob-specific variation
            const baseHue = colorManager.getHue(x, y, 0, combinedPattern, time);
            
            // Adjust for "temperature" - hotter at bottom, varies by blob
            const tempFactor = blobTemp + (1 - (y - containerTop) / (containerBottom - containerTop)) * 0.4;
            
            // Calculate final hue with variation
            hue = (baseHue + blobHue * 0.1) % 360;
            
            // Higher saturation for more vibrant lava
            saturation = colorManager.saturation;
            
            // Brightness varies with influence and flow pattern
            lightness = 30 + combinedPattern * 50 + flowPattern * 10;
            
            grid.setCell(x, y, {
                character: lavaChars[charSetIndex],
                hue,
                saturation,
                lightness
            });
            return;
        }
        
        // Default - empty space inside lamp
        charIndex = Math.floor(Math.random() * bgChars.length);
        
        // Dark inside lamp
        hue = colorManager.getHue(x, y, 0, 0.2, time);
        saturation = 10;
        lightness = 5 + Math.random() * 10;
        
        grid.setCell(x, y, {
            character: bgChars[charIndex],
            hue,
            saturation,
            lightness
        });
    });
}
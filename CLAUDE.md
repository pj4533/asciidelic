# AsciiDelic Project Guidelines

## Project Overview
AsciiDelic is a browser-based ASCII art animation system with various visual effects that renders colorful, dynamic visualizations using ASCII characters. The system features both automated and manual control modes for animation parameters.

## Running the Project
- Open `index.html` in a web browser to run the application
- No build process required - pure JavaScript loaded directly in browser

## Code Style Guidelines
- **Formatting**: Use 4 spaces for indentation
- **Naming**: 
  - camelCase for variables/functions
  - PascalCase for classes
- **Documentation**: Use JSDoc-style comments for functions and classes
- **Modules**: Use ES modules (import/export)
- **Error Handling**: Use console.error/warn for logging issues
- **Architecture**:
  - Core logic in `/src/core/`
  - Animations in `/src/animations/`
  - Utils in `/src/utils/`
  - Config in `/src/config/`
  - UI in `/src/ui/`

## Coding Conventions
- Follow existing patterns when adding new animations
- Keep animations modular and consistent with other implementation patterns
- Use ES6+ features (classes, arrow functions, destructuring)
- Focus on performance optimization for smooth animations

## UI and Control System
- The system supports both automated and manual modes
  - Automated mode: parameters change automatically for a dynamic experience
  - Manual mode: user has full control over all animation parameters
- Input handling is centralized in the `InputManager` class
- UI state management is handled by the `UIManager` class
- Available controls:
  - Up/Down arrows: Navigate between animations
  - Left/Right arrows: Shift color hue (manual mode)
  - Space: Cycle color modes (manual mode)
  - +/-: Adjust animation speed (manual mode)
  - S/D: Adjust character density (manual mode)
  - R: Randomize animation parameters (manual mode)
  - M: Toggle between automated and manual modes

## Animation System
- Each animation is a modular implementation with consistent interfaces
- Animations can be nested (e.g., Lava Lamp is a variation of Plasma)
- Core rendering done by the Engine class
- Grid-based rendering system with customizable character mappings

## Animation Types
Currently implemented animations:
- Lava Lamp (default)
- Plasma
- Nebula
- Flow Field
- Cellular
- Noise Cloud
- Spiral
- Waves
- Mandala
- Tunnels
  - Classic
  - Vortex
  - Wormhole

## Adding New Animations
To create a new animation:
1. Create a new file in the `src/animations/` directory
2. Implement the required animation interface (see existing animations for reference)
3. Register the animation in `src/animations/index.js`
4. Ensure it follows the pattern of accepting grid, time, deltaTime, config, characters, and colorManager parameters
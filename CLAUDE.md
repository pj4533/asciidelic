# AsciiDelic Project Guidelines

## Project Overview
AsciiDelic is a browser-based ASCII art animation system with various visual effects.

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

## Coding Conventions
- Follow existing patterns when adding new features
- Keep animations modular and consistent with other implementation patterns
- Use ES6+ features (classes, arrow functions, destructuring)
- Focus on performance optimization for smooth animations
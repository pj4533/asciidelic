# AsciiDelic

AsciiDelic is an interactive ASCII art animation engine that renders colorful, dynamic visualizations using ASCII characters in your browser. Create mesmerizing patterns with various effects and styles for a unique retro-digital art experience.

## 🌟 Features

- **7 Animation Types**: Choose from waves, spirals, tunnels, plasma, mandalas, vortex, and wormhole
- **Interactive Controls**: Easily change patterns, colors, speed, and density
- **Multiple Color Modes**: Rainbow, monochrome, complementary, and gradient
- **Rich Character Sets**: Various ASCII characters create different visual textures
- **Responsive Design**: Adapts to different screen sizes
- **No Dependencies**: Pure JavaScript without external libraries

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/asciidelic.git
   cd asciidelic
   ```

2. Open `index.html` in your web browser.

That's it! No build process or dependencies required.

## 🎮 Controls

| Key | Action |
|-----|--------|
| ↑/↓ | Change animation pattern |
| ←/→ | Shift color hue |
| Space | Cycle through color modes |
| +/- | Increase/decrease animation speed |
| S/D | Decrease/increase character density |

## 🧩 Project Structure

```
asciidelic/
├── src/
│   ├── animations/     # Animation effects
│   ├── config/         # Default configurations 
│   ├── core/           # Engine components
│   └── utils/          # Helper functions
├── index.html          # Main entry point
├── script.js           # Application loader
└── styles.css          # Basic styling
```

## 🛠️ Creating Your Own Animations

New animations can be added by following these steps:

1. Create a new file in the `src/animations/` directory
2. Implement your animation function that takes `grid`, `time`, and `config` parameters
3. Register your animation in `src/animations/index.js`


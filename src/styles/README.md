
# Styles Directory

This directory contains modular CSS files organized by purpose:

## Files Overview

- **variables.css** - CSS custom properties, design tokens, and theme variables
- **base.css** - Base styles, resets, and fundamental styling rules
- **components.css** - Component-specific styles and design patterns
- **utilities.css** - Utility classes and helper styles
- **animations.css** - Animation keyframes and motion effects

## Import Order

The files are imported in `src/index.css` in the following order:
1. Variables (design tokens)
2. Base styles (foundation)
3. Components (building blocks)
4. Utilities (helpers)
5. Animations (effects)

This order ensures proper CSS cascade and prevents style conflicts.

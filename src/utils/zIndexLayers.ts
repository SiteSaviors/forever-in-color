
/**
 * Centralized Z-Index Layer Management
 * 
 * This file defines a consistent z-index hierarchy to prevent overlay conflicts
 * and ensure proper visual stacking throughout the application.
 * 
 * Layers are organized from bottom to top:
 * - Base content (z-index 1-9)
 * - UI components (z-index 10-39) 
 * - Overlays and modals (z-index 40-59)
 * - System alerts and notifications (z-index 60+)
 */

export const Z_INDEX_LAYERS = {
  // Base content layers (1-9)
  BASE: 1,
  CONTENT: 2,
  
  // UI component layers (10-39)
  DROPDOWN: 10,
  TOOLTIP: 15,
  STICKY_ELEMENTS: 20,
  FLOATING_BUTTONS: 25,
  NAVIGATION: 30,
  
  // Interactive overlay layers (40-59)
  LIGHTBOX_BACKDROP: 40,
  MODAL_BACKDROP: 45,
  STYLE_CARD_OVERLAYS: 50,
  DIALOG: 55,
  
  // System notification layers (60+)
  TOAST: 60,
  CACHE_MONITOR: 65,
  SYSTEM_ALERTS: 70,
} as const;

/**
 * Helper function to get z-index value with optional offset
 * Useful for creating layered elements within the same category
 * 
 * @param layer - The base layer from Z_INDEX_LAYERS
 * @param offset - Additional z-index offset (default: 0)
 * @returns The calculated z-index value
 */
export const getZIndex = (layer: keyof typeof Z_INDEX_LAYERS, offset: number = 0): number => {
  return Z_INDEX_LAYERS[layer] + offset;
};

/**
 * Utility function to create z-index class names for Tailwind CSS
 * 
 * @param layer - The base layer from Z_INDEX_LAYERS
 * @param offset - Additional z-index offset (default: 0)
 * @returns Tailwind CSS class string for z-index
 */
export const getZIndexClass = (layer: keyof typeof Z_INDEX_LAYERS, offset: number = 0): string => {
  const zIndex = getZIndex(layer, offset);
  return `z-[${zIndex}]`;
};

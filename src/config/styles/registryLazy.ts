/**
 * Lazy-Loading Style Registry Facade
 *
 * This module provides on-demand loading of style registry data split by tone.
 * Each tone (classic, modern, stylized, etc.) is a separate chunk that loads
 * only when accessed.
 *
 * Architecture:
 * - registryCore.generated.ts: Lightweight metadata (1-2 KB)
 * - tones/*.generated.ts: Full style data per tone (~3-15 KB each)
 *
 * Usage:
 * ```typescript
 * // Load a single tone (when accordion expands)
 * const classicStyles = await loadToneStyles('classic');
 *
 * // Load a single style (when navigating directly)
 * const style = await loadStyleById('classic-oil-painting');
 *
 * // Load all styles (backward compatibility, migration period)
 * const allStyles = await loadAllStyles();
 * ```
 *
 * Performance Characteristics:
 * - Core metadata: ~1 KB (loaded eagerly)
 * - Per-tone chunk: 3-15 KB (loaded on first access)
 * - Cache: In-memory Map (persistent for session)
 * - Concurrent requests: Deduped via Promise cache
 *
 * @module registryLazy
 */

import type { StyleRegistryEntry, StyleTone } from './types';
import {
  STYLE_CORE_METADATA,
  STYLE_CORE_BY_ID,
  AVAILABLE_TONES,
} from './registryCore.generated';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Valid tone keys for dynamic imports.
 * Includes 'original' for the special null-tone style.
 */
type ToneKey = StyleTone | 'original';

/**
 * Shape of dynamically imported tone modules.
 */
interface ToneModule {
  TONE_STYLES: StyleRegistryEntry[];
  TONE_STYLES_BY_ID: Map<string, StyleRegistryEntry>;
}

// ============================================================================
// In-Memory Cache
// ============================================================================

/**
 * Cache for loaded tone registries.
 * Key: tone name, Value: Promise<StyleRegistryEntry[]>
 *
 * Promise-based cache ensures concurrent requests for the same tone
 * are deduped - only one network request happens.
 */
const toneCache = new Map<ToneKey, Promise<StyleRegistryEntry[]>>();

/**
 * Cache for individual style lookups.
 * Key: style ID, Value: StyleRegistryEntry
 *
 * Populated as styles are loaded via loadToneStyles().
 * Enables O(1) lookups for loadStyleById() after initial load.
 */
const styleCache = new Map<string, StyleRegistryEntry>();

/**
 * Development-only cache statistics for debugging.
 * Tracks hits, misses, and tone loads.
 */
interface CacheStats {
  toneLoads: number;
  toneHits: number;
  styleLookups: number;
  styleCacheHits: number;
}

const cacheStats: CacheStats = {
  toneLoads: 0,
  toneHits: 0,
  styleLookups: 0,
  styleCacheHits: 0,
};

// ============================================================================
// Core Loading Functions
// ============================================================================

/**
 * Load all styles for a specific tone.
 * Results are cached; subsequent calls return instantly from memory.
 *
 * Implementation Details:
 * - Uses dynamic import() for code splitting
 * - Caches Promise to dedupe concurrent requests
 * - Populates styleCache for O(1) lookups
 * - Handles import errors gracefully (returns empty array)
 *
 * @param tone - The tone to load ('classic', 'modern', etc.)
 * @returns Promise resolving to array of full style entries
 *
 * @example
 * ```typescript
 * // Load when accordion expands
 * const classicStyles = await loadToneStyles('classic');
 * console.log(`Loaded ${classicStyles.length} classic styles`);
 * ```
 */
export async function loadToneStyles(
  tone: ToneKey
): Promise<StyleRegistryEntry[]> {
  // Fast path: return from cache if already loaded
  if (toneCache.has(tone)) {
    if (import.meta.env.DEV) {
      cacheStats.toneHits++;
    }
    return toneCache.get(tone)!;
  }

  // Slow path: load from network
  if (import.meta.env.DEV) {
    cacheStats.toneLoads++;
    console.log(`[registryLazy] Loading tone "${tone}"...`);
  }

  const loadPromise = (async () => {
    try {
      // Dynamic import based on tone name
      // Vite requires explicit import paths, so we use a switch statement
      let module: ToneModule;

      switch (tone) {
        case 'classic':
          module = await import('./tones/classicTone.generated.js');
          break;
        case 'modern':
          module = await import('./tones/modernTone.generated.js');
          break;
        case 'stylized':
          module = await import('./tones/stylizedTone.generated.js');
          break;
        case 'electric':
          module = await import('./tones/electricTone.generated.js');
          break;
        case 'signature':
          module = await import('./tones/signatureTone.generated.js');
          break;
        case 'abstract':
          module = await import('./tones/abstractTone.generated.js');
          break;
        case 'trending':
          module = await import('./tones/trendingTone.generated.js');
          break;
        case 'original':
          module = await import('./tones/originalTone.generated.js');
          break;
        default:
          console.error(`[registryLazy] Unknown tone: "${tone}"`);
          toneCache.delete(tone);
          return [];
      }

      const styles = module.TONE_STYLES;

      if (!Array.isArray(styles)) {
        console.error(`[registryLazy] Invalid tone module for "${tone}": TONE_STYLES is not an array`);
        return [];
      }

      // Populate style cache for fast lookups
      styles.forEach(style => {
        styleCache.set(style.id, style);
      });

      if (import.meta.env.DEV) {
        console.log(`[registryLazy] Loaded ${styles.length} styles for tone "${tone}"`);
      }

      return styles;
    } catch (error) {
      console.error(`[registryLazy] Failed to load tone "${tone}":`, error);
      // Remove failed promise from cache so retry is possible
      toneCache.delete(tone);
      return [];
    }
  })();

  // Cache the promise to dedupe concurrent requests
  toneCache.set(tone, loadPromise);

  return loadPromise;
}

/**
 * Load a single style by ID.
 * Automatically detects which tone file to load.
 *
 * Implementation Strategy:
 * 1. Check styleCache for O(1) lookup (if tone already loaded)
 * 2. Look up tone from core metadata
 * 3. Load entire tone file (benefits other styles in same tone)
 * 4. Return requested style
 *
 * Trade-off: Loads entire tone file even for single style.
 * Rationale: User likely to interact with multiple styles in same tone.
 *
 * @param styleId - The style ID (e.g. 'classic-oil-painting')
 * @returns Promise resolving to style entry, or undefined if not found
 *
 * @example
 * ```typescript
 * // Load when user directly navigates to style
 * const style = await loadStyleById('classic-oil-painting');
 * if (style) {
 *   console.log(`Loaded: ${style.name}`);
 * }
 * ```
 */
export async function loadStyleById(
  styleId: string
): Promise<StyleRegistryEntry | undefined> {
  if (import.meta.env.DEV) {
    cacheStats.styleLookups++;
  }

  // Fast path: check cache first
  if (styleCache.has(styleId)) {
    if (import.meta.env.DEV) {
      cacheStats.styleCacheHits++;
    }
    return styleCache.get(styleId);
  }

  // Look up tone from core metadata
  const coreMeta = STYLE_CORE_BY_ID.get(styleId);
  if (!coreMeta) {
    console.warn(`[registryLazy] Style "${styleId}" not found in core metadata`);
    return undefined;
  }

  // Load entire tone file
  const tone = coreMeta.tone ?? 'original';
  const toneStyles = await loadToneStyles(tone);

  // Find style in loaded tone
  // (Should be in styleCache now, but we re-search for robustness)
  return toneStyles.find(s => s.id === styleId);
}

/**
 * Load all styles from all tones.
 *
 * Use Cases:
 * - Migration period (backward compatibility)
 * - Search/filtering across all styles
 * - Bulk operations requiring full registry
 *
 * WARNING: This loads all tone chunks (~50-60 KB total).
 * Prefer loadToneStyles() or loadStyleById() when possible.
 *
 * Performance: Loads tones in parallel, ~200-400ms on 3G.
 *
 * @returns Promise resolving to flat array of all styles
 *
 * @example
 * ```typescript
 * // Load all for search feature
 * const allStyles = await loadAllStyles();
 * const results = allStyles.filter(s => s.name.includes(query));
 * ```
 */
export async function loadAllStyles(): Promise<StyleRegistryEntry[]> {
  if (import.meta.env.DEV) {
    console.log('[registryLazy] Loading ALL styles from all tones...');
  }

  const tones = AVAILABLE_TONES as readonly ToneKey[];

  // Load all tones in parallel
  const toneArrays = await Promise.all(tones.map(loadToneStyles));

  // Flatten into single array
  const allStyles = toneArrays.flat();

  if (import.meta.env.DEV) {
    console.log(`[registryLazy] Loaded ${allStyles.length} total styles`);
  }

  return allStyles;
}

// ============================================================================
// Optimization Utilities
// ============================================================================

/**
 * Preload a tone in the background.
 *
 * Use Cases:
 * - Prefetch when you predict user will expand accordion
 * - Preload popular tones on page load (e.g., 'classic' + 'trending')
 * - Warm cache during idle time
 *
 * Non-blocking: Fire and forget, errors are logged but not thrown.
 *
 * @param tone - The tone to prefetch
 *
 * @example
 * ```typescript
 * // Prefetch when user hovers over accordion (before click)
 * onMouseEnter={() => prefetchTone('modern')}
 * ```
 */
export function prefetchTone(tone: ToneKey): void {
  // Fire and forget - errors logged by loadToneStyles
  void loadToneStyles(tone);
}

/**
 * Preload multiple tones in parallel.
 * Useful for eager loading common tones on app initialization.
 *
 * @param tones - Array of tones to prefetch
 *
 * @example
 * ```typescript
 * // Preload popular tones after initial render
 * useEffect(() => {
 *   prefetchTones(['classic', 'trending']);
 * }, []);
 * ```
 */
export function prefetchTones(tones: ToneKey[]): void {
  tones.forEach(prefetchTone);
}

/**
 * Check if a tone is already loaded in cache.
 * Useful for conditional rendering logic.
 *
 * @param tone - The tone to check
 * @returns true if tone is in cache (loaded)
 */
export function isToneLoaded(tone: ToneKey): boolean {
  return toneCache.has(tone);
}

/**
 * Check if a style is already in cache.
 * Useful for avoiding redundant loads.
 *
 * @param styleId - The style ID to check
 * @returns true if style is in cache
 */
export function isStyleLoaded(styleId: string): boolean {
  return styleCache.has(styleId);
}

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Clear all caches.
 *
 * Use Cases:
 * - Testing (reset state between tests)
 * - Forced refresh (user action)
 * - Memory pressure (advanced scenarios)
 *
 * WARNING: Next access will trigger re-download.
 * Most apps should never need this.
 */
export function clearCache(): void {
  toneCache.clear();
  styleCache.clear();

  if (import.meta.env.DEV) {
    console.log('[registryLazy] Cache cleared');
    // Reset stats
    cacheStats.toneLoads = 0;
    cacheStats.toneHits = 0;
    cacheStats.styleLookups = 0;
    cacheStats.styleCacheHits = 0;
  }
}

/**
 * Get current cache statistics (development only).
 * Useful for debugging and optimization.
 *
 * @returns Cache statistics object (empty object in production)
 */
export function getCacheStats(): CacheStats | Record<string, never> {
  if (import.meta.env.DEV) {
    return { ...cacheStats };
  }
  return {};
}

// ============================================================================
// Re-exports
// ============================================================================

/**
 * Export core metadata for lightweight operations.
 * Use when you only need IDs/names without full style data.
 */
export {
  STYLE_CORE_METADATA,
  STYLE_CORE_BY_ID,
  AVAILABLE_TONES,
} from './registryCore.generated';

/**
 * Export types for consumers.
 */
export type { StyleRegistryEntry, StyleTone, ToneKey };

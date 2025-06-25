
interface CachedPreview {
  url: string;
  timestamp: number;
  styleId: number;
  styleName: string;
  imageHash: string;
  aspectRatio: string;
  fileSize: number;
}

interface CacheStats {
  totalEntries: number;
  totalSizeBytes: number;
  hitRate: number;
  hits: number;
  misses: number;
}

class PreviewCacheManager {
  private cache = new Map<string, CachedPreview>();
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached previews
  private readonly MAX_MEMORY_MB = 100; // Maximum memory usage in MB
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private stats: CacheStats = {
    totalEntries: 0,
    totalSizeBytes: 0,
    hitRate: 0,
    hits: 0,
    misses: 0
  };

  // Generate cache key from image data and style
  private generateCacheKey(imageData: string, styleId: number, aspectRatio: string): string {
    const hash = this.hashString(imageData + styleId + aspectRatio);
    return `preview_${hash}`;
  }

  // Simple hash function for cache keys
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Estimate memory usage of a preview
  private estimateSize(previewUrl: string): number {
    // Rough estimate: base64 data URL size
    return previewUrl.length * 0.75; // base64 is ~33% larger than binary
  }

  // Check if cache entry is valid
  private isValid(entry: CachedPreview): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < this.CACHE_DURATION;
  }

  // Clean up expired and oversized cache
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (!this.isValid(entry)) {
        this.cache.delete(key);
        this.stats.totalSizeBytes -= entry.fileSize;
      }
    });

    // If still over limits, remove oldest entries
    if (this.cache.size > this.MAX_CACHE_SIZE || 
        this.stats.totalSizeBytes > this.MAX_MEMORY_MB * 1024 * 1024) {
      
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = Math.max(
        this.cache.size - this.MAX_CACHE_SIZE,
        Math.ceil(sortedEntries.length * 0.2) // Remove 20% if over memory limit
      );
      
      for (let i = 0; i < toRemove && i < sortedEntries.length; i++) {
        const [key, entry] = sortedEntries[i];
        this.cache.delete(key);
        this.stats.totalSizeBytes -= entry.fileSize;
      }
    }

    this.updateStats();
  }

  // Update cache statistics
  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.hitRate = this.stats.hits + this.stats.misses > 0 
      ? this.stats.hits / (this.stats.hits + this.stats.misses)
      : 0;
  }

  // Get cached preview if available
  getCachedPreview(imageData: string, styleId: number, aspectRatio: string): string | null {
    const key = this.generateCacheKey(imageData, styleId, aspectRatio);
    const entry = this.cache.get(key);
    
    if (entry && this.isValid(entry)) {
      this.stats.hits++;
      this.updateStats();
      console.log(`✅ Cache HIT for style ${styleId} (${entry.styleName})`);
      return entry.url;
    }
    
    this.stats.misses++;
    this.updateStats();
    console.log(`❌ Cache MISS for style ${styleId}`);
    return null;
  }

  // Store preview in cache
  cachePreview(
    imageData: string, 
    styleId: number, 
    styleName: string,
    aspectRatio: string,
    previewUrl: string
  ): void {
    const key = this.generateCacheKey(imageData, styleId, aspectRatio);
    const fileSize = this.estimateSize(previewUrl);
    
    const entry: CachedPreview = {
      url: previewUrl,
      timestamp: Date.now(),
      styleId,
      styleName,
      imageHash: this.hashString(imageData),
      aspectRatio,
      fileSize
    };
    
    this.cache.set(key, entry);
    this.stats.totalSizeBytes += fileSize;
    
    console.log(`💾 Cached preview for ${styleName} (${(fileSize / 1024).toFixed(1)}KB)`);
    
    // Cleanup if needed
    this.cleanup();
  }

  // Check if a preview exists for given parameters
  hasPreview(imageData: string, styleId: number, aspectRatio: string): boolean {
    const key = this.generateCacheKey(imageData, styleId, aspectRatio);
    const entry = this.cache.get(key);
    return entry !== undefined && this.isValid(entry);
  }

  // Get cache statistics
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
    this.stats = {
      totalEntries: 0,
      totalSizeBytes: 0,
      hitRate: 0,
      hits: 0,
      misses: 0
    };
    console.log('🗑️ Preview cache cleared');
  }

  // Get cache size in MB
  getCacheSizeMB(): number {
    return this.stats.totalSizeBytes / (1024 * 1024);
  }
}

// Global cache instance
export const previewCache = new PreviewCacheManager();

// Utility to log cache performance
export const logCachePerformance = (): void => {
  const stats = previewCache.getStats();
  console.log('📊 Cache Performance:', {
    entries: stats.totalEntries,
    sizeMB: (stats.totalSizeBytes / (1024 * 1024)).toFixed(2),
    hitRate: (stats.hitRate * 100).toFixed(1) + '%',
    hits: stats.hits,
    misses: stats.misses
  });
};


import { PhotoAnalysisResult } from './types';
import { AdvancedPhotoAnalyzer } from './AdvancedPhotoAnalyzer';

export class PhotoAnalysisEngine {
  private analyzer: AdvancedPhotoAnalyzer;
  private cache: Map<string, { result: PhotoAnalysisResult; timestamp: number }>;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.analyzer = new AdvancedPhotoAnalyzer();
    this.cache = new Map();
  }

  async analyzePhoto(imageUrl: string): Promise<PhotoAnalysisResult> {
    console.log('🔍 PhotoAnalysisEngine: Starting advanced photo analysis...');
    
    // Check cache first
    const cached = this.cache.get(imageUrl);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('✅ Using cached analysis result');
      return cached.result;
    }
    
    try {
      const startTime = performance.now();
      const result = await this.analyzer.analyzePhoto(imageUrl);
      const analysisTime = performance.now() - startTime;
      
      console.log(`✅ Advanced photo analysis completed in ${Math.round(analysisTime)}ms`, {
        orientation: result.orientation,
        hasPortrait: result.hasPortrait,
        dominantColors: result.dominantColors,
        complexity: result.complexity,
        confidence: result.confidence,
        styleAffinities: Object.keys(result.styleAffinities).length
      });
      
      // Cache the result
      this.cache.set(imageUrl, { result, timestamp: Date.now() });
      
      // Clean old cache entries
      this.cleanCache();
      
      return result;
    } catch (error) {
      console.error('❌ Advanced photo analysis failed:', error);
      
      // Return fallback basic analysis
      return this.getFallbackAnalysis(imageUrl);
    }
  }

  private async getFallbackAnalysis(imageUrl: string): Promise<PhotoAnalysisResult> {
    console.log('⚠️ Using fallback analysis...');
    
    // Basic fallback analysis
    return {
      orientation: 'square',
      hasPortrait: false,
      isLandscape: false,
      dominantColors: ['neutral'],
      contrast: 'medium',
      brightness: 0.5,
      saturation: 0.5,
      complexity: 'moderate',
      composition: {
        ruleOfThirds: 0.5,
        symmetry: 0.5,
        balance: 0.5
      },
      edgeIntensity: 0.5,
      textureComplexity: 0.5,
      subjectType: 'object',
      focusArea: { x: 0.5, y: 0.5, strength: 0.5 },
      styleAffinities: {
        1: 1.0,
        2: 0.7,
        4: 0.6,
        5: 0.5,
        6: 0.4,
        7: 0.4,
        8: 0.3,
        9: 0.5,
        10: 0.3,
        11: 0.4,
        13: 0.3,
        15: 0.4
      },
      confidence: 0.3,
      processingTime: Date.now(),
      version: '2.0.0-fallback'
    };
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics for debugging
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0.85 // Would track actual hit rate in production
    };
  }

  // Clear cache manually
  clearCache(): void {
    this.cache.clear();
  }
}

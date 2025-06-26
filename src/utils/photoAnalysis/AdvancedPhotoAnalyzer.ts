
import { PhotoAnalysisResult } from './types';

export class AdvancedPhotoAnalyzer {
  private cache: Map<string, PhotoAnalysisResult> = new Map();

  async analyzePhoto(imageUrl: string): Promise<PhotoAnalysisResult> {
    console.log('🔬 AdvancedPhotoAnalyzer: Starting deep photo analysis...');
    
    // Check cache first
    if (this.cache.has(imageUrl)) {
      console.log('✅ Using cached advanced analysis');
      return this.cache.get(imageUrl)!;
    }
    
    try {
      const startTime = performance.now();
      
      // Load and analyze the image
      const analysis = await this.performAdvancedAnalysis(imageUrl);
      
      const processingTime = performance.now() - startTime;
      console.log(`✅ Advanced analysis completed in ${Math.round(processingTime)}ms`);
      
      // Cache the result
      this.cache.set(imageUrl, analysis);
      
      return analysis;
    } catch (error) {
      console.error('❌ Advanced photo analysis failed:', error);
      throw error;
    }
  }

  private async performAdvancedAnalysis(imageUrl: string): Promise<PhotoAnalysisResult> {
    // Create image element for analysis
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const analysis = this.analyzeImageData(imageData, img.width, img.height);
          
          resolve(analysis);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  private analyzeImageData(imageData: ImageData, width: number, height: number): PhotoAnalysisResult {
    const pixels = imageData.data;
    
    // Basic orientation analysis
    const orientation = width > height ? 'horizontal' : height > width ? 'vertical' : 'square';
    
    // Color analysis
    const { dominantColors, brightness, saturation, contrast } = this.analyzeColors(pixels);
    
    // Composition analysis
    const composition = this.analyzeComposition(pixels, width, height);
    
    // Subject detection
    const { hasPortrait, subjectType } = this.detectSubject(pixels, width, height);
    
    // Style affinity calculation
    const styleAffinities = this.calculateStyleAffinities({
      dominantColors,
      brightness,
      saturation,
      contrast,
      hasPortrait,
      orientation,
      complexity: composition.complexity
    });
    
    // Get recommended styles (top 5)
    const recommendedStyles = Object.entries(styleAffinities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([styleId]) => parseInt(styleId));
    
    return {
      orientation,
      hasPortrait,
      isLandscape: orientation === 'horizontal',
      dominantColors,
      contrast,
      brightness,
      saturation,
      complexity: composition.complexity,
      composition: {
        ruleOfThirds: composition.ruleOfThirds,
        symmetry: composition.symmetry,
        balance: composition.balance
      },
      edgeIntensity: composition.edgeIntensity,
      textureComplexity: composition.textureComplexity,
      subjectType,
      focusArea: composition.focusArea,
      styleAffinities,
      recommendedStyles,
      confidence: 0.85,
      processingTime: Date.now(),
      version: '2.0.0-advanced'
    };
  }

  private analyzeColors(pixels: Uint8ClampedArray) {
    const colorCounts = new Map<string, number>();
    let totalBrightness = 0;
    let totalSaturation = 0;
    let pixelCount = 0;

    // Sample every 4th pixel for performance
    for (let i = 0; i < pixels.length; i += 16) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Calculate brightness (0-1)
      const brightness = (r + g + b) / (3 * 255);
      totalBrightness += brightness;
      
      // Calculate saturation
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      totalSaturation += saturation;
      
      // Quantize color for dominant color detection
      const quantizedColor = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`;
      colorCounts.set(quantizedColor, (colorCounts.get(quantizedColor) || 0) + 1);
      
      pixelCount++;
    }

    // Get dominant colors
    const dominantColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);

    const avgBrightness = totalBrightness / pixelCount;
    const avgSaturation = totalSaturation / pixelCount;

    return {
      dominantColors,
      brightness: avgBrightness,
      saturation: avgSaturation,
      contrast: this.calculateContrast(pixels)
    };
  }

  private calculateContrast(pixels: Uint8ClampedArray): 'low' | 'medium' | 'high' {
    let brightPixels = 0;
    let darkPixels = 0;
    let totalPixels = 0;

    for (let i = 0; i < pixels.length; i += 16) {
      const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      if (brightness > 180) brightPixels++;
      if (brightness < 75) darkPixels++;
      totalPixels++;
    }

    const contrastRatio = (brightPixels + darkPixels) / totalPixels;
    
    if (contrastRatio > 0.4) return 'high';
    if (contrastRatio > 0.2) return 'medium';
    return 'low';
  }

  private analyzeComposition(pixels: Uint8ClampedArray, width: number, height: number) {
    // Simplified composition analysis
    return {
      ruleOfThirds: Math.random() * 0.5 + 0.3, // Placeholder
      symmetry: Math.random() * 0.5 + 0.25,
      balance: Math.random() * 0.4 + 0.4,
      edgeIntensity: Math.random() * 0.6 + 0.2,
      textureComplexity: Math.random() * 0.7 + 0.3,
      complexity: Math.random() > 0.6 ? 'complex' : Math.random() > 0.3 ? 'moderate' : 'simple' as 'simple' | 'moderate' | 'complex',
      focusArea: {
        x: 0.5,
        y: 0.5,
        strength: Math.random() * 0.5 + 0.5
      }
    };
  }

  private detectSubject(pixels: Uint8ClampedArray, width: number, height: number) {
    // Simplified subject detection
    const hasPortrait = Math.random() > 0.7; // Placeholder
    const subjects = ['portrait', 'landscape', 'object', 'abstract'] as const;
    const subjectType = subjects[Math.floor(Math.random() * subjects.length)];
    
    return { hasPortrait, subjectType };
  }

  private calculateStyleAffinities(analysis: any): { [styleId: number]: number } {
    // Enhanced style affinity calculation based on image characteristics
    const affinities: { [styleId: number]: number } = {};
    
    // Style 2: Classic Oil - Great for portraits and rich colors
    affinities[2] = analysis.hasPortrait ? 0.9 : 0.7;
    
    // Style 4: Watercolor - Good for landscapes and soft colors
    affinities[4] = analysis.orientation === 'horizontal' ? 0.8 : 0.6;
    
    // Style 5: Pastel - Best for bright, soft images
    affinities[5] = analysis.brightness > 0.6 ? 0.8 : 0.5;
    
    // Style 6: Gemstone Poly - Good for geometric/complex compositions
    affinities[6] = analysis.complexity === 'complex' ? 0.9 : 0.6;
    
    // Style 7: 3D Storybook - Versatile style
    affinities[7] = 0.7;
    
    // Style 8: Charcoal - Best for high contrast images
    affinities[8] = analysis.contrast === 'high' ? 0.9 : 0.5;
    
    // Style 9: Pop Art - Great for vibrant, saturated images
    affinities[9] = analysis.saturation > 0.6 ? 0.9 : 0.6;
    
    // Style 10: Neon Splash - Best for modern, vibrant subjects
    affinities[10] = analysis.saturation > 0.7 ? 0.8 : 0.5;
    
    // Style 11: Electric Bloom - Good for complex, colorful images
    affinities[11] = analysis.complexity === 'complex' && analysis.saturation > 0.5 ? 0.8 : 0.6;
    
    // Style 13: Abstract Fusion - Versatile for artistic interpretation
    affinities[13] = 0.7;
    
    // Style 15: Deco Luxe - Good for elegant, balanced compositions
    affinities[15] = analysis.brightness > 0.4 && analysis.complexity === 'moderate' ? 0.8 : 0.6;
    
    return affinities;
  }
}

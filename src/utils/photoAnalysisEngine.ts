
export interface PhotoAnalysisResult {
  // Core image properties
  aspectRatio: number;
  orientation: 'portrait' | 'landscape' | 'square';
  dominantColors: string[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Content analysis
  subjectType: 'portrait' | 'landscape' | 'object' | 'abstract' | 'group' | 'pet';
  complexity: 'simple' | 'moderate' | 'complex';
  contrast: 'low' | 'medium' | 'high';
  brightness: 'dark' | 'normal' | 'bright';
  saturation: 'muted' | 'balanced' | 'vibrant';
  
  // Composition analysis
  hasPortrait: boolean;
  hasFaces: boolean;
  faceCount: number;
  isLandscape: boolean;
  hasText: boolean;
  
  // Style affinity scores (0-1)
  styleAffinities: {
    [styleId: number]: number;
  };
  
  // Recommended styles in order
  recommendedStyles: number[];
  confidence: number;
}

export class PhotoAnalysisEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not initialize canvas context');
    }
    this.ctx = ctx;
  }

  async analyzePhoto(imageUrl: string): Promise<PhotoAnalysisResult> {
    console.log('🔍 Starting advanced photo analysis...');
    
    const image = await this.loadImage(imageUrl);
    const basicProps = this.analyzeBasicProperties(image);
    const colorAnalysis = this.analyzeColors(image);
    const contentAnalysis = this.analyzeContent(image);
    const compositionAnalysis = this.analyzeComposition(image);
    
    const styleAffinities = this.calculateStyleAffinities({
      ...basicProps,
      ...colorAnalysis,
      ...contentAnalysis,
      ...compositionAnalysis
    });

    const recommendedStyles = this.generateStyleRecommendations(styleAffinities);
    
    const result: PhotoAnalysisResult = {
      ...basicProps,
      ...colorAnalysis,
      ...contentAnalysis,
      ...compositionAnalysis,
      styleAffinities,
      recommendedStyles,
      confidence: this.calculateConfidence(styleAffinities)
    };

    console.log('✅ Photo analysis complete:', result);
    return result;
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private analyzeBasicProperties(image: HTMLImageElement) {
    const aspectRatio = image.width / image.height;
    let orientation: 'portrait' | 'landscape' | 'square';
    
    if (aspectRatio > 1.2) {
      orientation = 'landscape';
    } else if (aspectRatio < 0.8) {
      orientation = 'portrait';
    } else {
      orientation = 'square';
    }

    return {
      aspectRatio,
      orientation
    };
  }

  private analyzeColors(image: HTMLImageElement) {
    this.canvas.width = Math.min(image.width, 300);
    this.canvas.height = Math.min(image.height, 300);
    this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;
    
    // Color analysis
    const colorMap = new Map<string, number>();
    let totalBrightness = 0;
    let totalSaturation = 0;
    let pixelCount = 0;

    for (let i = 0; i < pixels.length; i += 16) { // Sample every 4th pixel for performance
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Calculate brightness
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      
      // Calculate saturation
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      totalSaturation += saturation;
      
      // Quantize color for dominant color detection
      const quantizedColor = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`;
      colorMap.set(quantizedColor, (colorMap.get(quantizedColor) || 0) + 1);
      
      pixelCount++;
    }

    // Get dominant colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);

    const avgBrightness = totalBrightness / pixelCount;
    const avgSaturation = totalSaturation / pixelCount;

    return {
      dominantColors: sortedColors,
      colorPalette: {
        primary: sortedColors[0] || '128,128,128',
        secondary: sortedColors[1] || '64,64,64',
        accent: sortedColors[2] || '192,192,192'
      },
      brightness: avgBrightness > 180 ? 'bright' as const : avgBrightness < 75 ? 'dark' as const : 'normal' as const,
      saturation: avgSaturation > 0.6 ? 'vibrant' as const : avgSaturation < 0.3 ? 'muted' as const : 'balanced' as const,
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

  private analyzeContent(image: HTMLImageElement) {
    // Simplified content analysis based on aspect ratio and color distribution
    const aspectRatio = image.width / image.height;
    
    // Basic heuristics for content type
    let subjectType: PhotoAnalysisResult['subjectType'] = 'object';
    let complexity: PhotoAnalysisResult['complexity'] = 'moderate';
    
    if (aspectRatio < 0.9 && aspectRatio > 0.6) {
      subjectType = 'portrait';
    } else if (aspectRatio > 1.5) {
      subjectType = 'landscape';
    }

    // Complexity based on image size and assumed detail
    if (image.width * image.height > 1000000) {
      complexity = 'complex';
    } else if (image.width * image.height < 200000) {
      complexity = 'simple';
    }

    return {
      subjectType,
      complexity,
      hasText: false // Would need OCR for real text detection
    };
  }

  private analyzeComposition(image: HTMLImageElement) {
    const aspectRatio = image.width / image.height;
    
    return {
      hasPortrait: aspectRatio < 0.9,
      hasFaces: aspectRatio < 0.9, // Simplified assumption
      faceCount: aspectRatio < 0.9 ? 1 : 0,
      isLandscape: aspectRatio > 1.3
    };
  }

  private calculateStyleAffinities(analysis: any): { [styleId: number]: number } {
    const affinities: { [styleId: number]: number } = {};
    
    // Style 1: Original Image - always moderate affinity
    affinities[1] = 0.5;
    
    // Style 2: Classic Oil Painting - great for portraits and complex images
    affinities[2] = analysis.hasPortrait ? 0.9 : 0.6;
    if (analysis.complexity === 'complex') affinities[2] += 0.1;
    if (analysis.contrast === 'high') affinities[2] += 0.1;
    
    // Style 4: Watercolor Dreams - perfect for landscapes and soft images
    affinities[4] = analysis.isLandscape ? 0.9 : 0.5;
    if (analysis.saturation === 'muted') affinities[4] += 0.2;
    if (analysis.brightness === 'bright') affinities[4] += 0.1;
    
    // Style 5: Pastel Bliss - ideal for portraits and soft lighting
    affinities[5] = analysis.hasPortrait ? 0.8 : 0.4;
    if (analysis.brightness === 'bright') affinities[5] += 0.2;
    if (analysis.saturation === 'muted') affinities[5] += 0.2;
    
    // Style 6: Gemstone Poly - modern, geometric style
    affinities[6] = analysis.complexity === 'simple' ? 0.7 : 0.4;
    if (analysis.subjectType === 'object') affinities[6] += 0.2;
    
    // Style 7: 3D Storybook - fun, animated style
    affinities[7] = analysis.saturation === 'vibrant' ? 0.8 : 0.5;
    if (analysis.brightness === 'bright') affinities[7] += 0.1;
    
    // Style 8: Artisan Charcoal - dramatic black and white
    affinities[8] = analysis.contrast === 'high' ? 0.9 : 0.3;
    if (analysis.hasPortrait) affinities[8] += 0.2;
    
    // Style 9: Pop Art Burst - high contrast, vibrant images
    affinities[9] = analysis.contrast === 'high' && analysis.saturation === 'vibrant' ? 0.9 : 0.4;
    if (analysis.brightness === 'bright') affinities[9] += 0.1;
    
    // Style 10: Neon Splash - vibrant, energetic
    affinities[10] = analysis.saturation === 'vibrant' ? 0.8 : 0.3;
    if (analysis.contrast === 'high') affinities[10] += 0.2;
    
    // Style 11: Electric Bloom - futuristic, high-tech
    affinities[11] = analysis.contrast === 'high' ? 0.7 : 0.4;
    if (analysis.saturation === 'vibrant') affinities[11] += 0.2;
    
    // Style 13: Abstract Fusion - artistic, creative
    affinities[13] = analysis.complexity === 'complex' ? 0.7 : 0.5;
    if (analysis.subjectType === 'abstract') affinities[13] += 0.3;
    
    // Style 15: Deco Luxe - elegant, sophisticated
    affinities[15] = analysis.brightness === 'normal' ? 0.6 : 0.4;
    if (analysis.hasPortrait) affinities[15] += 0.2;

    // Normalize affinities to 0-1 range
    Object.keys(affinities).forEach(styleId => {
      affinities[parseInt(styleId)] = Math.min(1, Math.max(0, affinities[parseInt(styleId)]));
    });

    return affinities;
  }

  private generateStyleRecommendations(affinities: { [styleId: number]: number }): number[] {
    return Object.entries(affinities)
      .sort(([, a], [, b]) => b - a)
      .map(([styleId]) => parseInt(styleId));
  }

  private calculateConfidence(affinities: { [styleId: number]: number }): number {
    const scores = Object.values(affinities);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Higher confidence when there's a clear winner
    return Math.min(1, (maxScore - avgScore) + 0.5);
  }
}

export const photoAnalysisEngine = new PhotoAnalysisEngine();

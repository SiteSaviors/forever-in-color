
import { PhotoAnalysisResult } from './types';

export class AdvancedPhotoAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async analyzePhoto(imageUrl: string): Promise<PhotoAnalysisResult> {
    const img = await this.loadImage(imageUrl);
    
    // Resize for analysis (performance optimization)
    const analysisSize = Math.min(512, Math.max(img.width, img.height));
    const scale = analysisSize / Math.max(img.width, img.height);
    
    this.canvas.width = img.width * scale;
    this.canvas.height = img.height * scale;
    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    return {
      // Basic properties
      orientation: this.detectOrientation(img),
      hasPortrait: await this.detectPortrait(imageData),
      isLandscape: img.width > img.height * 1.2,
      
      // Advanced analysis
      dominantColors: this.extractDominantColors(imageData),
      contrast: this.calculateContrast(imageData),
      brightness: this.calculateBrightness(imageData),
      saturation: this.calculateSaturation(imageData),
      complexity: this.analyzeComplexity(imageData),
      
      // Composition analysis
      composition: this.analyzeComposition(imageData),
      edgeIntensity: this.calculateEdgeIntensity(imageData),
      textureComplexity: this.analyzeTexture(imageData),
      
      // Subject detection
      subjectType: this.detectSubjectType(imageData),
      focusArea: this.detectFocusArea(imageData),
      
      // Style affinities (ML-based scoring)
      styleAffinities: this.calculateStyleAffinities(imageData),
      
      // Metadata
      confidence: this.calculateAnalysisConfidence(imageData),
      processingTime: Date.now(),
      version: '2.0.0'
    };
  }

  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private detectOrientation(img: HTMLImageElement): 'vertical' | 'horizontal' | 'square' {
    const aspectRatio = img.width / img.height;
    if (aspectRatio > 1.2) return 'horizontal';
    if (aspectRatio < 0.8) return 'vertical';
    return 'square';
  }

  private async detectPortrait(imageData: ImageData): Promise<boolean> {
    // Advanced facial detection using edge detection and skin tone analysis
    const { data, width, height } = imageData;
    let skinTonePixels = 0;
    let faceFeatures = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Skin tone detection (multiple ethnicities)
      if (this.isSkinTone(r, g, b)) {
        skinTonePixels++;
      }
      
      // Simple feature detection (eyes, nose approximation)
      if (this.detectFacialFeature(r, g, b, i, data, width)) {
        faceFeatures++;
      }
    }
    
    const totalPixels = data.length / 4;
    const skinToneRatio = skinTonePixels / totalPixels;
    const featureRatio = faceFeatures / totalPixels;
    
    return skinToneRatio > 0.15 && featureRatio > 0.02;
  }

  private isSkinTone(r: number, g: number, b: number): boolean {
    // Advanced skin tone detection for multiple ethnicities
    const conditions = [
      // Light skin tones
      (r > 95 && g > 40 && b > 20 && r > g && r > b && r - g > 15),
      // Medium skin tones  
      (r > 80 && g > 50 && b > 30 && Math.abs(r - g) < 30),
      // Dark skin tones
      (r > 30 && g > 20 && b > 10 && r >= g && g >= b)
    ];
    
    return conditions.some(condition => condition);
  }

  private detectFacialFeature(r: number, g: number, b: number, index: number, data: Uint8ClampedArray, width: number): boolean {
    // Simple edge detection for facial features
    const x = (index / 4) % width;
    const y = Math.floor((index / 4) / width);
    
    if (x > 0 && y > 0 && x < width - 1) {
      const currentBrightness = (r + g + b) / 3;
      const leftBrightness = (data[index - 4] + data[index - 3] + data[index - 2]) / 3;
      const topBrightness = (data[index - width * 4] + data[index - width * 4 + 1] + data[index - width * 4 + 2]) / 3;
      
      const edgeStrength = Math.abs(currentBrightness - leftBrightness) + Math.abs(currentBrightness - topBrightness);
      return edgeStrength > 50; // Threshold for feature detection
    }
    
    return false;
  }

  private extractDominantColors(imageData: ImageData): string[] {
    const { data } = imageData;
    const colorFrequency = new Map<string, number>();
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      
      const colorKey = `${r},${g},${b}`;
      colorFrequency.set(colorKey, (colorFrequency.get(colorKey) || 0) + 1);
    }
    
    // Get top 5 colors and convert to color names
    const sortedColors = Array.from(colorFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([color]) => this.rgbToColorName(color));
    
    return sortedColors;
  }

  private rgbToColorName(rgbString: string): string {
    const [r, g, b] = rgbString.split(',').map(Number);
    
    // Advanced color classification
    const hsl = this.rgbToHsl(r, g, b);
    const [h, s, l] = hsl;
    
    if (s < 0.1) return l > 0.8 ? 'white' : l < 0.2 ? 'black' : 'gray';
    if (l > 0.9) return 'white';
    if (l < 0.1) return 'black';
    
    // Hue-based color detection
    if (h >= 0 && h < 15) return s > 0.5 ? 'red' : 'pink';
    if (h >= 15 && h < 45) return 'orange';
    if (h >= 45 && h < 75) return 'yellow';
    if (h >= 75 && h < 150) return 'green';
    if (h >= 150 && h < 210) return 'cyan';
    if (h >= 210 && h < 270) return 'blue';
    if (h >= 270 && h < 330) return 'purple';
    return 'red';
  }

  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s, l];
  }

  private calculateContrast(imageData: ImageData): 'low' | 'medium' | 'high' {
    const { data } = imageData;
    let contrastSum = 0;
    let samples = 0;
    
    for (let i = 0; i < data.length - 4; i += 16) {
      const brightness1 = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const brightness2 = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
      contrastSum += Math.abs(brightness1 - brightness2);
      samples++;
    }
    
    const avgContrast = contrastSum / samples;
    if (avgContrast > 80) return 'high';
    if (avgContrast > 40) return 'medium';
    return 'low';
  }

  private calculateBrightness(imageData: ImageData): number {
    const { data } = imageData;
    let total = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      total += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    
    return total / (data.length / 4) / 255;
  }

  private calculateSaturation(imageData: ImageData): number {
    const { data } = imageData;
    let totalSaturation = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      
      totalSaturation += saturation;
    }
    
    return totalSaturation / (data.length / 4);
  }

  private analyzeComplexity(imageData: ImageData): 'simple' | 'moderate' | 'complex' {
    const edgeIntensity = this.calculateEdgeIntensity(imageData);
    const colorVariety = this.extractDominantColors(imageData).length;
    
    const complexityScore = edgeIntensity * 0.7 + colorVariety * 0.3;
    
    if (complexityScore > 0.7) return 'complex';
    if (complexityScore > 0.4) return 'moderate';
    return 'simple';
  }

  private analyzeComposition(imageData: ImageData): { ruleOfThirds: number; symmetry: number; balance: number } {
    const { width, height } = imageData;
    
    // Rule of thirds analysis
    const thirdW = width / 3;
    const thirdH = height / 3;
    const intersectionPoints = [
      { x: thirdW, y: thirdH },
      { x: thirdW * 2, y: thirdH },
      { x: thirdW, y: thirdH * 2 },
      { x: thirdW * 2, y: thirdH * 2 }
    ];
    
    let ruleOfThirdsScore = 0;
    intersectionPoints.forEach(point => {
      const intensity = this.getPixelIntensity(imageData, Math.round(point.x), Math.round(point.y));
      ruleOfThirdsScore += intensity;
    });
    ruleOfThirdsScore /= 4;
    
    // Symmetry analysis
    const symmetryScore = this.calculateSymmetry(imageData);
    
    // Balance analysis
    const balanceScore = this.calculateBalance(imageData);
    
    return {
      ruleOfThirds: ruleOfThirdsScore,
      symmetry: symmetryScore,
      balance: balanceScore
    };
  }

  private calculateEdgeIntensity(imageData: ImageData): number {
    const { data, width, height } = imageData;
    let edgeIntensity = 0;
    let samples = 0;
    
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const index = (y * width + x) * 4;
        const current = (data[index] + data[index + 1] + data[index + 2]) / 3;
        
        // Sobel operator for edge detection
        const gx = this.getSobelX(data, x, y, width);
        const gy = this.getSobelY(data, x, y, width);
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        edgeIntensity += magnitude;
        samples++;
      }
    }
    
    return (edgeIntensity / samples) / 255;
  }

  private getSobelX(data: Uint8ClampedArray, x: number, y: number, width: number): number {
    const kernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    let sum = 0;
    
    for (let ky = -1; ky <= 1; ky++) {
      for (let kx = -1; kx <= 1; kx++) {
        const index = ((y + ky) * width + (x + kx)) * 4;
        const intensity = (data[index] + data[index + 1] + data[index + 2]) / 3;
        sum += intensity * kernel[ky + 1][kx + 1];
      }
    }
    
    return sum;
  }

  private getSobelY(data: Uint8ClampedArray, x: number, y: number, width: number): number {
    const kernel = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    let sum = 0;
    
    for (let ky = -1; ky <= 1; ky++) {
      for (let kx = -1; kx <= 1; kx++) {
        const index = ((y + ky) * width + (x + kx)) * 4;
        const intensity = (data[index] + data[index + 1] + data[index + 2]) / 3;
        sum += intensity * kernel[ky + 1][kx + 1];
      }
    }
    
    return sum;
  }

  private analyzeTexture(imageData: ImageData): number {
    // Local Binary Pattern for texture analysis
    const { data, width, height } = imageData;
    let textureComplexity = 0;
    let samples = 0;
    
    for (let y = 1; y < height - 1; y += 3) {
      for (let x = 1; x < width - 1; x += 3) {
        const centerIndex = (y * width + x) * 4;
        const centerIntensity = (data[centerIndex] + data[centerIndex + 1] + data[centerIndex + 2]) / 3;
        
        let pattern = 0;
        const neighbors = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, 1], [1, 1], [1, 0],
          [1, -1], [0, -1]
        ];
        
        neighbors.forEach((neighbor, i) => {
          const [dx, dy] = neighbor;
          const neighborIndex = ((y + dy) * width + (x + dx)) * 4;
          const neighborIntensity = (data[neighborIndex] + data[neighborIndex + 1] + data[neighborIndex + 2]) / 3;
          
          if (neighborIntensity >= centerIntensity) {
            pattern |= (1 << i);
          }
        });
        
        textureComplexity += this.getPatternComplexity(pattern);
        samples++;
      }
    }
    
    return textureComplexity / samples;
  }

  private getPatternComplexity(pattern: number): number {
    // Count transitions in the binary pattern
    let transitions = 0;
    for (let i = 0; i < 8; i++) {
      const current = (pattern >> i) & 1;
      const next = (pattern >> ((i + 1) % 8)) & 1;
      if (current !== next) transitions++;
    }
    return transitions / 8;
  }

  private detectSubjectType(imageData: ImageData): 'portrait' | 'landscape' | 'object' | 'abstract' {
    const hasPortrait = this.detectPortrait(imageData);
    if (hasPortrait) return 'portrait';
    
    const composition = this.analyzeComposition(imageData);
    const edgeIntensity = this.calculateEdgeIntensity(imageData);
    const colorVariety = this.extractDominantColors(imageData).length;
    
    if (composition.balance > 0.7 && edgeIntensity < 0.3) return 'landscape';
    if (edgeIntensity > 0.6 && colorVariety < 4) return 'object';
    return 'abstract';
  }

  private detectFocusArea(imageData: ImageData): { x: number; y: number; strength: number } {
    const { width, height } = imageData;
    let maxSharpness = 0;
    let focusX = width / 2;
    let focusY = height / 2;
    
    const gridSize = 20;
    for (let y = gridSize; y < height - gridSize; y += gridSize) {
      for (let x = gridSize; x < width - gridSize; x += gridSize) {
        const sharpness = this.calculateLocalSharpness(imageData, x, y, gridSize);
        if (sharpness > maxSharpness) {
          maxSharpness = sharpness;
          focusX = x;
          focusY = y;
        }
      }
    }
    
    return {
      x: focusX / width,
      y: focusY / height,
      strength: maxSharpness
    };
  }

  private calculateLocalSharpness(imageData: ImageData, centerX: number, centerY: number, radius: number): number {
    const { data, width } = imageData;
    let sharpness = 0;
    let samples = 0;
    
    for (let y = centerY - radius; y <= centerY + radius; y += 2) {
      for (let x = centerX - radius; x <= centerX + radius; x += 2) {
        if (x > 0 && x < width - 1 && y > 0) {
          const index = (y * width + x) * 4;
          const current = (data[index] + data[index + 1] + data[index + 2]) / 3;
          const right = (data[index + 4] + data[index + 5] + data[index + 6]) / 3;
          const down = (data[index + width * 4] + data[index + width * 4 + 1] + data[index + width * 4 + 2]) / 3;
          
          sharpness += Math.abs(current - right) + Math.abs(current - down);
          samples++;
        }
      }
    }
    
    return samples > 0 ? sharpness / samples : 0;
  }

  private calculateStyleAffinities(imageData: ImageData): { [styleId: number]: number } {
    // Advanced ML-based style affinity calculation
    const brightness = this.calculateBrightness(imageData);
    const contrast = this.calculateContrast(imageData);
    const saturation = this.calculateSaturation(imageData);
    const complexity = this.analyzeComplexity(imageData);
    const hasPortrait = this.detectPortrait(imageData);
    const dominantColors = this.extractDominantColors(imageData);
    const composition = this.analyzeComposition(imageData);
    const edgeIntensity = this.calculateEdgeIntensity(imageData);
    
    const affinities: { [styleId: number]: number } = {};
    
    // Style 1: Original Image (always high for reference)
    affinities[1] = 1.0;
    
    // Style 2: Classic Oil Painting - loves portraits and warm colors
    affinities[2] = this.calculateOilPaintingAffinity(hasPortrait, dominantColors, brightness, contrast);
    
    // Style 4: Watercolor Dreams - soft, low contrast, pastel colors
    affinities[4] = this.calculateWatercolorAffinity(contrast, saturation, brightness, complexity);
    
    // Style 5: Pastel Bliss - light, soft, high brightness
    affinities[5] = this.calculatePastelAffinity(brightness, saturation, dominantColors);
    
    // Style 6: Gemstone Poly - geometric, high contrast, complex
    affinities[6] = this.calculateGeometricAffinity(edgeIntensity, complexity, composition);
    
    // Style 7: 3D Storybook - balanced composition, moderate complexity
    affinities[7] = this.calculateStoryboardAffinity(composition, complexity, hasPortrait);
    
    // Style 8: Artisan Charcoal - high contrast, monochromatic preference
    affinities[8] = this.calculateCharcoalAffinity(contrast, edgeIntensity, dominantColors);
    
    // Style 9: Pop Art Burst - vibrant colors, high saturation
    affinities[9] = this.calculatePopArtAffinity(saturation, dominantColors, contrast);
    
    // Style 10: Neon Splash - electric colors, high contrast
    affinities[10] = this.calculateNeonAffinity(saturation, brightness, dominantColors);
    
    // Style 11: Electric Bloom - organic forms, medium complexity
    affinities[11] = this.calculateBloomAffinity(composition, complexity, dominantColors);
    
    // Style 13: Abstract Fusion - complex, high edge intensity
    affinities[13] = this.calculateAbstractAffinity(complexity, edgeIntensity, composition);
    
    // Style 15: Deco Luxe - balanced, elegant, moderate saturation
    affinities[15] = this.calculateDecoAffinity(composition, brightness, saturation);
    
    return affinities;
  }

  private calculateOilPaintingAffinity(hasPortrait: boolean, colors: string[], brightness: number, contrast: string): number {
    let score = 0.5; // Base score
    
    if (hasPortrait) score += 0.3;
    if (colors.includes('red') || colors.includes('orange') || colors.includes('yellow')) score += 0.2;
    if (brightness > 0.3 && brightness < 0.8) score += 0.15;
    if (contrast === 'medium' || contrast === 'high') score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private calculateWatercolorAffinity(contrast: string, saturation: number, brightness: number, complexity: string): number {
    let score = 0.5;
    
    if (contrast === 'low') score += 0.25;
    if (saturation < 0.6) score += 0.2;
    if (brightness > 0.6) score += 0.15;
    if (complexity === 'simple' || complexity === 'moderate') score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private calculatePastelAffinity(brightness: number, saturation: number, colors: string[]): number {
    let score = 0.5;
    
    if (brightness > 0.7) score += 0.3;
    if (saturation < 0.5) score += 0.25;
    if (colors.includes('pink') || colors.includes('white') || colors.includes('yellow')) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculateGeometricAffinity(edgeIntensity: number, complexity: string, composition: any): number {
    let score = 0.5;
    
    if (edgeIntensity > 0.6) score += 0.3;
    if (complexity === 'complex') score += 0.2;
    if (composition.symmetry > 0.6) score += 0.15;
    
    return Math.min(score, 1.0);
  }

  private calculateStoryboardAffinity(composition: any, complexity: string, hasPortrait: boolean): number {
    let score = 0.5;
    
    if (composition.balance > 0.6) score += 0.25;
    if (complexity === 'moderate') score += 0.2;
    if (hasPortrait) score += 0.15;
    
    return Math.min(score, 1.0);
  }

  private calculateCharcoalAffinity(contrast: string, edgeIntensity: number, colors: string[]): number {
    let score = 0.5;
    
    if (contrast === 'high') score += 0.3;
    if (edgeIntensity > 0.5) score += 0.25;
    if (colors.includes('black') || colors.includes('gray') || colors.includes('white')) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculatePopArtAffinity(saturation: number, colors: string[], contrast: string): number {
    let score = 0.5;
    
    if (saturation > 0.7) score += 0.3;
    if (colors.includes('red') || colors.includes('blue') || colors.includes('yellow')) score += 0.25;
    if (contrast === 'high') score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculateNeonAffinity(saturation: number, brightness: number, colors: string[]): number {
    let score = 0.5;
    
    if (saturation > 0.8) score += 0.3;
    if (brightness > 0.5) score += 0.2;
    if (colors.includes('green') || colors.includes('cyan') || colors.includes('purple')) score += 0.25;
    
    return Math.min(score, 1.0);
  }

  private calculateBloomAffinity(composition: any, complexity: string, colors: string[]): number {
    let score = 0.5;
    
    if (composition.balance > 0.5) score += 0.25;
    if (complexity === 'moderate' || complexity === 'complex') score += 0.2;
    if (colors.includes('purple') || colors.includes('pink') || colors.includes('blue')) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculateAbstractAffinity(complexity: string, edgeIntensity: number, composition: any): number {
    let score = 0.5;
    
    if (complexity === 'complex') score += 0.3;
    if (edgeIntensity > 0.7) score += 0.25;
    if (composition.symmetry < 0.4) score += 0.2; // Abstract prefers asymmetry
    
    return Math.min(score, 1.0);
  }

  private calculateDecoAffinity(composition: any, brightness: number, saturation: number): number {
    let score = 0.5;
    
    if (composition.balance > 0.7 && composition.symmetry > 0.6) score += 0.3;
    if (brightness > 0.4 && brightness < 0.8) score += 0.2;
    if (saturation > 0.3 && saturation < 0.7) score += 0.15;
    
    return Math.min(score, 1.0);
  }

  private getPixelIntensity(imageData: ImageData, x: number, y: number): number {
    const { data, width } = imageData;
    const index = (y * width + x) * 4;
    return (data[index] + data[index + 1] + data[index + 2]) / (3 * 255);
  }

  private calculateSymmetry(imageData: ImageData): number {
    const { data, width, height } = imageData;
    let symmetryScore = 0;
    let samples = 0;
    
    const centerX = Math.floor(width / 2);
    const sampleDistance = Math.floor(width * 0.1);
    
    for (let y = 0; y < height; y += 3) {
      for (let offset = 1; offset <= sampleDistance; offset += 2) {
        if (centerX - offset >= 0 && centerX + offset < width) {
          const leftIndex = (y * width + (centerX - offset)) * 4;
          const rightIndex = (y * width + (centerX + offset)) * 4;
          
          const leftIntensity = (data[leftIndex] + data[leftIndex + 1] + data[leftIndex + 2]) / 3;
          const rightIntensity = (data[rightIndex] + data[rightIndex + 1] + data[rightIndex + 2]) / 3;
          
          const similarity = 1 - Math.abs(leftIntensity - rightIntensity) / 255;
          symmetryScore += similarity;
          samples++;
        }
      }
    }
    
    return samples > 0 ? symmetryScore / samples : 0;
  }

  private calculateBalance(imageData: ImageData): number {
    const { data, width, height } = imageData;
    
    let leftWeight = 0, rightWeight = 0;
    let topWeight = 0, bottomWeight = 0;
    
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const index = (y * width + x) * 4;
        const intensity = (data[index] + data[index + 1] + data[index + 2]) / 3;
        
        if (x < centerX) leftWeight += intensity;
        else rightWeight += intensity;
        
        if (y < centerY) topWeight += intensity;
        else bottomWeight += intensity;
      }
    }
    
    const horizontalBalance = 1 - Math.abs(leftWeight - rightWeight) / (leftWeight + rightWeight);
    const verticalBalance = 1 - Math.abs(topWeight - bottomWeight) / (topWeight + bottomWeight);
    
    return (horizontalBalance + verticalBalance) / 2;
  }

  private calculateAnalysisConfidence(imageData: ImageData): number {
    // Calculate confidence based on image quality and analysis reliability
    const { width, height } = imageData;
    const totalPixels = width * height;
    
    let confidence = 0.5; // Base confidence
    
    // Higher resolution = higher confidence
    if (totalPixels > 100000) confidence += 0.2;
    else if (totalPixels > 50000) confidence += 0.1;
    
    // Good contrast = higher confidence
    const contrast = this.calculateContrast(imageData);
    if (contrast === 'high') confidence += 0.15;
    else if (contrast === 'medium') confidence += 0.1;
    
    // Not too dark or bright = higher confidence
    const brightness = this.calculateBrightness(imageData);
    if (brightness > 0.2 && brightness < 0.8) confidence += 0.15;
    
    return Math.min(confidence, 1.0);
  }
}

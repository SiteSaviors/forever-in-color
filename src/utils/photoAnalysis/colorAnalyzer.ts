
import { ColorAnalysis } from './types';

export class ColorAnalyzer {
  static analyzeColors(pixels: Uint8ClampedArray): ColorAnalysis {
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
      brightness: avgBrightness > 180 ? 'bright' : avgBrightness < 75 ? 'dark' : 'normal',
      saturation: avgSaturation > 0.6 ? 'vibrant' : avgSaturation < 0.3 ? 'muted' : 'balanced',
      contrast: this.calculateContrast(pixels)
    };
  }

  private static calculateContrast(pixels: Uint8ClampedArray): 'low' | 'medium' | 'high' {
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
}

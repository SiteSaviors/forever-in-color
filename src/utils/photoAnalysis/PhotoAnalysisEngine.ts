
import { PhotoAnalysisResult, ImageProperties, ColorAnalysis, ContentAnalysis, CompositionAnalysis } from './types';
import { ImageProcessor } from './imageProcessor';
import { ColorAnalyzer } from './colorAnalyzer';
import { StyleAffinityCalculator } from './styleAffinityCalculator';

export class PhotoAnalysisEngine {
  async analyzePhoto(imageUrl: string): Promise<PhotoAnalysisResult> {
    console.log('🔍 Starting advanced photo analysis...');
    
    const image = await ImageProcessor.loadImage(imageUrl);
    const basicProps = this.analyzeBasicProperties(image);
    const { canvas, ctx } = ImageProcessor.setupCanvas(image);
    const imageData = ImageProcessor.getImageData(ctx, canvas);
    
    const colorAnalysis = ColorAnalyzer.analyzeColors(imageData.data);
    const contentAnalysis = this.analyzeContent(image);
    const compositionAnalysis = this.analyzeComposition(image);
    
    const combinedAnalysis = {
      ...basicProps,
      ...colorAnalysis,
      ...contentAnalysis,
      ...compositionAnalysis
    };
    
    const styleAffinities = StyleAffinityCalculator.calculateStyleAffinities(combinedAnalysis);
    const recommendedStyles = StyleAffinityCalculator.generateStyleRecommendations(styleAffinities);
    const confidence = StyleAffinityCalculator.calculateConfidence(styleAffinities);
    
    const result: PhotoAnalysisResult = {
      ...combinedAnalysis,
      styleAffinities,
      recommendedStyles,
      confidence
    };

    console.log('✅ Photo analysis complete:', result);
    return result;
  }

  private analyzeBasicProperties(image: HTMLImageElement): ImageProperties {
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

  private analyzeContent(image: HTMLImageElement): ContentAnalysis {
    // Simplified content analysis based on aspect ratio and color distribution
    const aspectRatio = image.width / image.height;
    
    // Basic heuristics for content type
    let subjectType: ContentAnalysis['subjectType'] = 'object';
    let complexity: ContentAnalysis['complexity'] = 'moderate';
    
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

  private analyzeComposition(image: HTMLImageElement): CompositionAnalysis {
    const aspectRatio = image.width / image.height;
    
    return {
      hasPortrait: aspectRatio < 0.9,
      hasFaces: aspectRatio < 0.9, // Simplified assumption
      faceCount: aspectRatio < 0.9 ? 1 : 0,
      isLandscape: aspectRatio > 1.3
    };
  }
}

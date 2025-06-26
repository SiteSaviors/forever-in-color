
export interface PhotoAnalysisResult {
  // Basic properties
  orientation: 'vertical' | 'horizontal' | 'square';
  hasPortrait: boolean;
  isLandscape: boolean;
  
  // Color analysis
  dominantColors: string[];
  contrast: 'low' | 'medium' | 'high';
  brightness: number; // 0-1
  saturation: number; // 0-1
  
  // Complexity and composition
  complexity: 'simple' | 'moderate' | 'complex';
  composition: {
    ruleOfThirds: number; // 0-1
    symmetry: number; // 0-1
    balance: number; // 0-1
  };
  
  // Advanced analysis
  edgeIntensity: number; // 0-1
  textureComplexity: number; // 0-1
  subjectType: 'portrait' | 'landscape' | 'object' | 'abstract';
  focusArea: {
    x: number; // 0-1 (normalized coordinates)
    y: number; // 0-1
    strength: number; // 0-1
  };
  
  // ML-based style affinities
  styleAffinities: { [styleId: number]: number }; // 0-1 confidence for each style
  recommendedStyles: number[]; // Top recommended style IDs in order
  
  // Metadata
  confidence: number; // 0-1 confidence in the analysis
  processingTime: number; // timestamp
  version: string; // analysis engine version
}

export interface ColorAnalysis {
  dominantColors: string[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  brightness: 'bright' | 'normal' | 'dark';
  saturation: 'vibrant' | 'balanced' | 'muted';
  contrast: 'low' | 'medium' | 'high';
}

export interface AnalysisCache {
  result: PhotoAnalysisResult;
  timestamp: number;
  hitCount: number;
}

export interface PerformanceMetrics {
  averageAnalysisTime: number;
  cacheHitRate: number;
  totalAnalyses: number;
  errorRate: number;
}

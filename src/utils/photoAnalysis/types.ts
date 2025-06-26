
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

export interface ImageProperties {
  aspectRatio: number;
  orientation: 'portrait' | 'landscape' | 'square';
}

export interface ColorAnalysis {
  dominantColors: string[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
  brightness: 'dark' | 'normal' | 'bright';
  saturation: 'muted' | 'balanced' | 'vibrant';
  contrast: 'low' | 'medium' | 'high';
}

export interface ContentAnalysis {
  subjectType: 'portrait' | 'landscape' | 'object' | 'abstract' | 'group' | 'pet';
  complexity: 'simple' | 'moderate' | 'complex';
  hasText: boolean;
}

export interface CompositionAnalysis {
  hasPortrait: boolean;
  hasFaces: boolean;
  faceCount: number;
  isLandscape: boolean;
}

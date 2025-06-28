
export interface FloatingFrameConfig {
  enabled: boolean;
  color: 'white' | 'black' | 'espresso';
}

export interface CustomizationUpdateHandler {
  (updates: Partial<CustomizationOptions>): void;
}

export interface CustomizationOptions {
  floatingFrame: FloatingFrameConfig;
  livingMemory: boolean;
  voiceMatch: boolean;
  customMessage: string;
  aiUpscale: boolean;
}

export interface PremiumVideoOptions {
  voiceMatching: boolean;
  backgroundAudio: 'none' | 'ambient' | 'classical' | 'nature';
  videoLength: number;
  voiceEnhancement: boolean;
}

export interface CanvasPreviewData {
  canvasFrame: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  artworkPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CustomizationCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
  price?: number;
  badge?: string;
}

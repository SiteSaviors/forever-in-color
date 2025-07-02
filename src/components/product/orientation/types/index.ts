
// Consolidated orientation types
export interface OrientationOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface SizeOption {
  size: string;
  category: string;
  description: string;
  salePrice: number;
  originalPrice: number;
  popular?: boolean;
}

export interface OrientationSelectorProps {
  selectedOrientation: string;
  selectedSize: string;
  onOrientationChange: (orientation: string) => void;
  onSizeChange: (size: string) => void;
  onContinue?: () => void;
}

// Canvas preview related types
export interface CanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
  size?: string;
  isSelected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
  variant?: 'interactive' | 'morphing' | 'simple';
}

// Size card related types
export interface SizeCardProps {
  size: string;
  salePrice: number;
  originalPrice: number;
  popular?: boolean;
  isRecommended?: boolean;
  isSelected: boolean;
  onClick: () => void;
  onContinue: (e: React.MouseEvent) => void;
}

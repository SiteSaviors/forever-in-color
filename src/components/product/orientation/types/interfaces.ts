
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

export interface ValidationError {
  field: 'orientation' | 'size' | 'general';
  message: string;
  type: 'error' | 'warning';
}

export interface OrientationSelectorProps {
  selectedOrientation: string;
  selectedSize: string;
  onOrientationChange: (orientation: string) => void;
  onSizeChange: (size: string) => void;
  onContinue?: () => void;
}

export interface ExtendedOrientationSelectorProps extends OrientationSelectorProps {
  userImageUrl?: string | null;
  currentStep?: number;
  completedSteps?: number[];
  onStepChange?: (step: number) => void;
}

export interface LayoutSelectionProps {
  selectedOrientation: string;
  userImageUrl: string | null;
  onOrientationChange: (orientation: string) => void;
  isUpdating: boolean;
  disabled?: boolean;
  validationErrors?: ValidationError[];
  showErrors?: boolean;
}

export interface SizeSelectionProps {
  selectedOrientation: string;
  selectedSize: string;
  userImageUrl: string | null;
  onSizeChange: (size: string) => void;
  onContinue?: () => void;
  isUpdating: boolean;
  disabled?: boolean;
  validationErrors?: ValidationError[];
  showErrors?: boolean;
}

export interface GlassMorphismSizeCardProps {
  option: SizeOption;
  orientation: string;
  isSelected: boolean;
  userImageUrl: string | null;
  isRecommended?: boolean;
  disabled?: boolean;
  onClick: () => void;
  onContinue: (e?: React.MouseEvent) => void;
  // Accessibility props
  role?: string;
  'aria-checked'?: boolean;
  'aria-labelledby'?: string;
  tabIndex?: number;
  'data-size'?: string;
  className?: string;
}

export interface OrientationStateHook {
  isUpdating: boolean;
  handleOrientationSelect: (orientation: string) => void;
  canContinueToNext: boolean;
}

export interface UseValidationProps {
  selectedOrientation: string;
  selectedSize: string;
  isRequired?: boolean;
}

export interface UseAccessibilityProps {
  selectedOrientation: string;
  selectedSize: string;
  orientationOptions: string[];
  sizeOptions: string[];
  onOrientationChange: (orientation: string) => void;
  onSizeChange: (size: string) => void;
  onContinue?: () => void;
  disabled?: boolean;
}

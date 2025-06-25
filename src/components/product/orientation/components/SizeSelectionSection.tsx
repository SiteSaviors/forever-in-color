
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  KeyboardEvent,
  forwardRef,
} from 'react';
import GlassMorphismSizeCard from './GlassMorphismSizeCard';
import SizeHeader from './SizeHeader';
import ValidationMessage from './ValidationMessage';
import { sizeOptions } from '../data/sizeOptions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowDown, DollarSign } from 'lucide-react';
import { SizeSelectionProps } from '../types/interfaces';
import { ErrorBoundary } from 'react-error-boundary';

// Centralized mappings
const RECOMMENDATIONS: Record<string, string> = {
  square: '24" x 24"',
  horizontal: '24" x 18"',
  vertical: '18" x 24"',
};

const PRICE_MAP: Record<string, number> = {
  '16" x 12"': 99.99,
  '24" x 18"': 149.99,
  '36" x 24"': 199.99,
  '40" x 30"': 269.99,
  '48" x 32"': 349.99,
  '60" x 40"': 499.99,
  '12" x 16"': 99.99,
  '18" x 24"': 149.99,
  '24" x 36"': 199.99,
  '30" x 40"': 269.99,
  '32" x 48"': 349.99,
  '40" x 60"': 499.99,
  '16" x 16"': 99.99,
  '24" x 24"': 149.99,
  '32" x 32"': 199.99,
  '36" x 36"': 269.99,
};

// Fallback UI for errors
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Oops! Something went wrong in the size selection.{' '}
        <button onClick={resetErrorBoundary} className="underline">
          Try again
        </button>
      </AlertDescription>
    </Alert>
  );
}

const SizeSelectionSectionInner: React.FC<SizeSelectionProps> = ({
  selectedOrientation,
  selectedSize,
  userImageUrl,
  onSizeChange,
  onContinue,
  isUpdating = false,
  disabled = false,
  validationErrors = [],
  showErrors = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const radiogroupRef = useRef<HTMLDivElement>(null);

  const recommendedSize = useMemo(() => RECOMMENDATIONS[selectedOrientation] || '', [selectedOrientation]);

  const availableSizes = useMemo(
    () => sizeOptions[selectedOrientation] || [],
    [selectedOrientation]
  );

  const isBusy = isUpdating || isProcessing || disabled;
  const hasSizeError = validationErrors.some(
    (e) => e.field === 'size' && e.type === 'error'
  );

  // Keyboard navigation within radiogroup
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const radios = Array.from(
        radiogroupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]') || []
      );
      const currentIndex = radios.findIndex(
        (r) => r.getAttribute('aria-checked') === 'true'
      );
      let newIndex = currentIndex;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        newIndex = (currentIndex + 1) % radios.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        newIndex = (currentIndex - 1 + radios.length) % radios.length;
      }

      if (newIndex !== currentIndex && radios[newIndex]) {
        const next = radios[newIndex];
        next.focus();
        next.click();
        e.preventDefault();
      }
    },
    []
  );

  const handleSelect = useCallback(
    async (size: string) => {
      if (isBusy) return;
      setIsProcessing(true);
      try {
        onSizeChange(size);
      } catch (err) {
        console.error('Size selection failed:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [isBusy, onSizeChange]
  );

  const handleContinueWithSize = useCallback(
    async (size: string, event?: React.MouseEvent) => {
      event?.preventDefault();
      if (isBusy) return;
      setIsProcessing(true);
      try {
        onSizeChange(size);
        onContinue?.();
      } catch (err) {
        console.error('Continue action failed:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [isBusy, onSizeChange, onContinue]
  );

  if (!selectedOrientation) return null;
  if (availableSizes.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>No sizes available for the selected orientation.</AlertDescription>
      </Alert>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="size-selection-heading">
      {/* Step Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-purple-600 animate-bounce">
          <ArrowDown className="w-4 h-4" />
          <span className="text-sm font-medium">Now choose your size</span>
          <ArrowDown className="w-4 h-4" />
        </div>
      </div>

      <SizeHeader />

      {/* Validation */}
      <ValidationMessage
        errors={validationErrors.filter((e) => e.field === 'size')}
        showErrors={showErrors}
        className="mb-4"
      />

      {/* Size Selection */}
      <fieldset
        className="space-y-6"
        data-size-group
        aria-labelledby="size-selection-heading"
        aria-describedby="size-selection-description"
      >
        <legend className="sr-only">Choose your canvas size</legend>

        <div>
          <h3
            id="size-selection-heading"
            className="text-xl font-semibold text-gray-900 mb-2"
          >
            Select Your Size
          </h3>
          <p
            id="size-selection-description"
            className="text-gray-600 mb-4"
          >
            Choose the perfect size for your space and budget
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          role="radiogroup"
          aria-required="true"
          aria-invalid={hasSizeError}
          ref={radiogroupRef}
          onKeyDown={handleKeyDown}
        >
          {availableSizes.map((option) => (
            <GlassMorphismSizeCard
              key={option.size}
              option={option}
              orientation={selectedOrientation}
              isSelected={selectedSize === option.size}
              isRecommended={option.size === recommendedSize}
              userImageUrl={userImageUrl}
              onClick={() => handleSelect(option.size)}
              onContinue={(e) => handleContinueWithSize(option.size, e)}
              disabled={isBusy}
              role="radio"
              aria-checked={selectedSize === option.size}
              aria-labelledby={`size-${option.size}-label`}
              tabIndex={selectedSize === option.size ? 0 : -1}
            />
          ))}
        </div>

        <div className="sr-only" aria-live="polite">
          Use arrow keys to navigate. Press Enter or Space to select.
        </div>
      </fieldset>

      {/* Price Display */}
      {selectedSize && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <DollarSign className="w-5 h-5" />
            <span className="text-lg font-semibold">
              Starting at ${PRICE_MAP[selectedSize]?.toFixed(2)} for {selectedSize} canvas
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Final price will be calculated with your customizations
          </p>
        </div>
      )}
    </section>
  );
};

const SizeSelectionSection = forwardRef<HTMLDivElement, SizeSelectionProps>((props, ref) => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
    <SizeSelectionSectionInner {...props} />
  </ErrorBoundary>
));

SizeSelectionSection.displayName = 'SizeSelectionSection';
export default SizeSelectionSection;

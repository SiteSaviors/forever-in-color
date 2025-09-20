
import { memo } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface ProductStepContainerProps {
  stepNumber: number;
  children: React.ReactNode;
}

const ProductStepContainer = memo(({ stepNumber, children }: ProductStepContainerProps) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600">Failed to load step {stepNumber}. Please try refreshing the page.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
});

ProductStepContainer.displayName = 'ProductStepContainer';

export default ProductStepContainer;

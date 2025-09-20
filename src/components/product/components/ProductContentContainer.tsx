
import { memo } from 'react';

interface ProductContentContainerProps {
  children: React.ReactNode;
}

const ProductContentContainer = memo(({ children }: ProductContentContainerProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  );
});

ProductContentContainer.displayName = 'ProductContentContainer';

export default ProductContentContainer;

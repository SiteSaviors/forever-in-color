
import { memo } from 'react';

interface ProductContentContainerProps {
  children: React.ReactNode;
}

const ProductContentContainer = memo(({ children }: ProductContentContainerProps) => {
  return (
    <div className="relative bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 min-h-screen">
      {/* Premium floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-violet-200/30 to-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-fuchsia-200/30 to-pink-300/30 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-gradient-to-br from-purple-200/20 to-violet-300/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 relative z-10">
        {children}
      </div>
    </div>
  );
});

ProductContentContainer.displayName = 'ProductContentContainer';

export default ProductContentContainer;

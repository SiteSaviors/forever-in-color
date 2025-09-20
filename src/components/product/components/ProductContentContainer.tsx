
import { memo } from 'react';

interface ProductContentContainerProps {
  children: React.ReactNode;
}

const ProductContentContainer = memo(({ children }: ProductContentContainerProps) => {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-violet-900 to-fuchsia-900 min-h-screen overflow-hidden">
      {/* Hero-style premium floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-48 h-48 bg-gradient-to-br from-cyan-300/20 to-violet-400/20 rounded-full blur-3xl animate-pulse float-slow" />
        <div className="absolute top-40 right-20 w-36 h-36 bg-gradient-to-br from-fuchsia-300/25 to-rose-400/25 rounded-full blur-2xl animate-pulse delay-1000 float-fast" />
        <div className="absolute bottom-40 left-1/3 w-56 h-56 bg-gradient-to-br from-violet-300/15 to-cyan-400/15 rounded-full blur-3xl animate-pulse delay-2000 float-gentle" />
        <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-gradient-to-br from-rose-300/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-3000" />
        
        {/* Hero-style background textures */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-500/5 to-fuchsia-500/5" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 relative z-10">
        {children}
      </div>
    </div>
  );
});

ProductContentContainer.displayName = 'ProductContentContainer';

export default ProductContentContainer;

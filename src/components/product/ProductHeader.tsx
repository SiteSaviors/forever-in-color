
import { Sparkles } from "lucide-react";

interface ProductHeaderProps {
  completedSteps: number[];
  totalSteps: number;
}

const ProductHeader = ({ completedSteps, totalSteps }: ProductHeaderProps) => {
  return (
    <section className="pt-8 md:pt-12 pb-2 md:pb-3">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
          <span className="text-xs md:text-sm font-medium text-purple-600 bg-purple-100 px-2 md:px-3 py-1 rounded-full">
            AI-Powered Art Creation
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold font-poppins tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3 md:mb-4">
          Create Your Masterpiece
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-3 md:mb-4 max-w-2xl mx-auto leading-relaxed">
          Turn your favorite moments into timeless art — with stunning AI art styles and 'Living Memory' videos you can see, hear, and feel.
        </p>
      </div>
    </section>
  );
};

export default ProductHeader;


import CanvasPreview from "./CanvasPreview";
import PricingDisplay from "./PricingDisplay";
import { SizeOption } from "../../types";

interface GlassMorphismCardContentProps {
  option: SizeOption;
  orientation: string;
  userImageUrl: string | null;
  cardState: "selected" | "recommended" | "default";
}

const GlassMorphismCardContent = ({
  option,
  orientation,
  userImageUrl,
  cardState
}: GlassMorphismCardContentProps) => {
  return (
    <>
      {/* Enhanced Canvas Preview with hover effects */}
      <div className={`
        flex justify-center transition-all duration-500
        ${cardState === "selected" ? 'scale-110 drop-shadow-2xl' : 'group-hover:scale-105 group-hover:drop-shadow-xl'}
      `}>
        <CanvasPreview 
          orientation={orientation}
          userImageUrl={userImageUrl}
        />
      </div>

      {/* Size Information with enhanced typography and drop shadow */}
      <div className="text-center">
        <h3 className={`
          text-2xl md:text-3xl font-bold tracking-tight font-poppins transition-colors duration-300 drop-shadow-sm
          ${cardState === "selected" ? 'text-purple-800' : cardState === "recommended" ? 'text-amber-800' : 'text-gray-800'}
        `}>
          {option.size}
        </h3>
      </div>

      {/* Enhanced Pricing Display with modern styling */}
      <PricingDisplay 
        salePrice={option.salePrice}
        originalPrice={option.originalPrice}
      />

      {/* Description with enhanced styling and drop shadow */}
      <div className={`
        rounded-2xl p-5 text-center border backdrop-blur-sm transition-all duration-300 shadow-sm
        ${cardState === "selected"
          ? 'bg-gradient-to-r from-purple-50/95 to-violet-50/80 border-purple-200/70 shadow-purple-100'
          : cardState === "recommended"
          ? 'bg-gradient-to-r from-amber-50/95 to-yellow-50/80 border-amber-200/70 shadow-amber-100'
          : 'bg-gradient-to-r from-slate-50/95 to-gray-50/80 border-slate-200/50 shadow-gray-100'
        }
      `}>
        <p className={`
          text-sm md:text-base leading-relaxed font-medium transition-colors duration-300 tracking-tight font-poppins drop-shadow-sm
          ${cardState === "selected" ? 'text-purple-700' : cardState === "recommended" ? 'text-amber-700' : 'text-gray-700'}
        `}>
          {option.description}
        </p>
      </div>
    </>
  );
};

export default GlassMorphismCardContent;

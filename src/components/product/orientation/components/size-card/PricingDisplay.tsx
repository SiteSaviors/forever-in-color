
import { getPriceDisplay } from "../../../utils/pricingUtils";

interface PricingDisplayProps {
  salePrice: number;
  originalPrice: number;
}

const PricingDisplay = ({ salePrice, originalPrice }: PricingDisplayProps) => {
  const pricing = getPriceDisplay(salePrice, originalPrice);

  return (
    <div className="text-center space-y-2">
      <div className="bg-white/80 rounded-xl p-4 border border-white/40">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-bold text-purple-600">
            {pricing.salePriceFormatted}
          </span>
          {pricing.hasDiscount && (
            <span className="text-lg text-gray-500 line-through">
              {pricing.originalPriceFormatted}
            </span>
          )}
        </div>
        
        {pricing.hasDiscount && (
          <p className="text-sm text-green-600 font-semibold mt-1">
            🎉 Limited Time: {pricing.discountPercentage}% Off
          </p>
        )}
      </div>
    </div>
  );
};

export default PricingDisplay;

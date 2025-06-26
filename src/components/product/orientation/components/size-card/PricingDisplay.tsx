
interface PricingDisplayProps {
  salePrice: number;
  originalPrice: number;
}

const PricingDisplay = ({ salePrice, originalPrice }: PricingDisplayProps) => {
  const hasDiscount = originalPrice > salePrice;
  const discountPercentage = hasDiscount 
    ? Math.round((originalPrice - salePrice) / originalPrice * 100) 
    : 0;

  return (
    <div className="text-center space-y-2">
      <div className="bg-white/80 rounded-xl p-4 border border-white/40">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-bold text-purple-600">
            ${salePrice}
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-500 line-through">${originalPrice}</span>
          )}
        </div>
        
        {hasDiscount && (
          <p className="text-sm text-green-600 font-semibold mt-1">
            🎉 Limited Time: {discountPercentage}% Off
          </p>
        )}
      </div>
    </div>
  );
};

export default PricingDisplay;

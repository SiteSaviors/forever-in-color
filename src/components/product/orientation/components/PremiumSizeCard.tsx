import { SizeOption } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown, Zap, Heart } from "lucide-react";
import InteractiveCanvasPreview from "./InteractiveCanvasPreview";

interface PremiumSizeCardProps {
  option: SizeOption;
  orientation: string;
  isSelected: boolean;
  userImageUrl: string | null;
  isRecommended?: boolean;
  onClick: () => void;
  onContinue: (e: React.MouseEvent) => void;
}

const PremiumSizeCard = ({ 
  option, 
  orientation, 
  isSelected, 
  userImageUrl,
  isRecommended = false,
  onClick, 
  onContinue 
}: PremiumSizeCardProps) => {
  const getRoomContext = (size: string) => {
    const contexts = {
      '8" x 8"': 'Perfect for desks & shelves',
      '12" x 12"': 'Ideal for gallery walls',
      '16" x 16"': 'Statement piece for any room',
      '20" x 20"': 'Bold focal point',
      '24" x 24"': 'Luxury centerpiece',
      '8" x 10"': 'Cozy personal spaces',
      '11" x 14"': 'Classic home display',
      '16" x 20"': 'Professional presentation',
      '18" x 24"': 'Impressive wall art',
      '24" x 36"': 'Grand statement piece',
      '10" x 8"': 'Modern accent piece',
      '14" x 11"': 'Sophisticated display',
      '20" x 16"': 'Eye-catching feature',
      '24" x 18"': 'Premium wall art',
      '36" x 24"': 'Luxury showcase'
    };
    return contexts[size] || 'Beautiful for any space';
  };

  const getPopularityIcon = () => {
    if (option.popular) return <Crown className="w-3 h-3" />;
    if (option.salePrice < option.originalPrice) return <Zap className="w-3 h-3" />;
    return <Heart className="w-3 h-3" />;
  };

  const getPopularityLabel = () => {
    if (option.popular) return "Most Popular";
    if (option.salePrice < option.originalPrice) return "Best Value";
    return "Customer Favorite";
  };

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-500 ${
        isSelected ? 'scale-105' : 'hover:scale-102'
      }`}
      onClick={onClick}
    >
      {/* Premium Background */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
        isSelected 
          ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 shadow-2xl shadow-purple-500/20 border-2 border-purple-500' 
          : 'bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-purple-300'
      }`}></div>

      {/* Content Container */}
      <div className="relative p-6 space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          {(option.popular || isRecommended) && (
            <Badge className={`${
              isRecommended 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600'
            } text-white shadow-lg`}>
              {getPopularityIcon()}
              <span className="ml-1">{isRecommended ? 'AI Pick' : getPopularityLabel()}</span>
            </Badge>
          )}
          
          {option.originalPrice > option.salePrice && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Save ${option.originalPrice - option.salePrice}
            </Badge>
          )}
        </div>

        {/* Canvas Preview - Only show when we have a user image */}
        <div className="mb-4">
          <InteractiveCanvasPreview
            orientation={orientation}
            userImageUrl={userImageUrl}
            isSelected={isSelected}
            isRecommended={isRecommended}
            onClick={() => {}} // Prevent nested clicks
          />
        </div>

        {/* Size Information */}
        <div className="text-center space-y-2">
          <h5 className="font-bold text-lg text-gray-900">{option.size}</h5>
          <p className="text-sm text-purple-600 font-medium">{getRoomContext(option.size)}</p>
          <p className="text-xs text-gray-500">{option.category}</p>
        </div>

        {/* Premium Pricing Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ${option.salePrice}
            </span>
            {option.originalPrice > option.salePrice && (
              <span className="text-lg text-gray-500 line-through">${option.originalPrice}</span>
            )}
          </div>
          
          {option.originalPrice > option.salePrice && (
            <p className="text-sm text-green-600 font-semibold">
              🎉 Limited Time: {Math.round(((option.originalPrice - option.salePrice) / option.originalPrice) * 100)}% Off
            </p>
          )}
        </div>

        {/* Premium Description */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-700">{option.description}</p>
        </div>

        {/* Continue Button - Enhanced */}
        {isSelected && (
          <Button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            Continue with {option.size}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Premium Hover Effects */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
    </div>
  );
};

export default PremiumSizeCard;
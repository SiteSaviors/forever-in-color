
import { SizeOption } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Crown, Zap, Heart, Sparkles } from "lucide-react";
import MorphingCanvasPreview from "./MorphingCanvasPreview";
interface GlassMorphismSizeCardProps {
  option: SizeOption;
  orientation: string;
  isSelected: boolean;
  userImageUrl: string | null;
  isRecommended?: boolean;
  onClick: () => void;
  onContinue: (e: React.MouseEvent) => void;
}
const GlassMorphismSizeCard = ({
  option,
  orientation,
  isSelected,
  userImageUrl,
  isRecommended = false,
  onClick,
  onContinue
}: GlassMorphismSizeCardProps) => {
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
  return <div className={`relative group cursor-pointer transition-all duration-700 ${isSelected ? 'scale-105' : 'hover:scale-102'}`} onClick={onClick} role="button" tabIndex={0} aria-pressed={isSelected} aria-label={`Select ${option.size} size`} onKeyDown={e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }}>
      {/* Glass Morphism Background */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-500 backdrop-blur-xl ${isSelected ? 'bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-purple-500/20 shadow-2xl shadow-purple-500/25 border-2 border-white/30' : 'bg-white/70 shadow-xl hover:shadow-2xl border border-white/40 hover:border-white/60'}`}>
        {/* Animated Gradient Overlay */}
        <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${isSelected ? 'bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 opacity-100' : 'bg-gradient-to-br from-gray-100/50 via-transparent to-gray-200/50 opacity-0 group-hover:opacity-100'}`} />
      </div>

      {/* Content Container */}
      <div className="relative p-6 space-y-4">
        {/* Top Badges with Glass Effect */}
        <div className="flex items-center justify-between">
          {(option.popular || isRecommended) && <Badge className={`${isRecommended ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90' : 'bg-gradient-to-r from-purple-600/90 to-pink-600/90'} text-white shadow-lg backdrop-blur-sm border border-white/20`}>
              {getPopularityIcon()}
              <span className="ml-1">{isRecommended ? 'AI Pick' : getPopularityLabel()}</span>
            </Badge>}
          
          {option.originalPrice > option.salePrice && <Badge className="bg-green-500/80 text-white border border-green-300/30 backdrop-blur-sm shadow-lg">
              Save ${(option.originalPrice - option.salePrice).toFixed(2)}
            </Badge>}
        </div>

        {/* Canvas Preview - Show only canvas mockup without user image */}
        <div className="mb-4">
          <MorphingCanvasPreview 
            orientation={orientation} 
            userImageUrl={null} // Pass null to only show canvas frame
            size={option.size} 
            isSelected={isSelected} 
            isRecommended={isRecommended} 
            onClick={() => {}} // Prevent nested clicks
          />
        </div>

        {/* Size Information with Glass Background */}
        <div className="text-center space-y-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/30">
            <h5 className="font-bold text-gray-900 mb-1 text-2xl">{option.size}</h5>
            <p className="text-sm text-purple-600 font-medium">{getRoomContext(option.size)}</p>
            <p className="text-xs text-gray-500">{option.category}</p>
          </div>
        </div>

        {/* Premium Pricing Display with Enhanced Glass Effect */}
        <div className="text-center space-y-2">
          <div className="bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-inner">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ${option.salePrice}
              </span>
              {option.originalPrice > option.salePrice && <span className="text-lg text-gray-500 line-through">${option.originalPrice}</span>}
            </div>
            
            {option.originalPrice > option.salePrice && <p className="text-sm text-green-600 font-semibold mt-1">
                🎉 Limited Time: {Math.round((option.originalPrice - option.salePrice) / option.originalPrice * 100)}% Off
              </p>}
          </div>
        </div>

        {/* Premium Description with Glass Effect */}
        <div className="bg-gradient-to-r from-gray-50/80 to-gray-100/60 backdrop-blur-sm rounded-lg p-3 text-center border border-white/30">
          <p className="text-sm text-gray-700">{option.description}</p>
        </div>

        {/* Enhanced Continue Button */}
        {isSelected && <Button onClick={onContinue} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-105 backdrop-blur-sm border border-white/20 min-h-[48px]" size="lg">
            <Sparkles className="w-4 h-4 mr-2" />
            Continue with {option.size}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>}
      </div>

      {/* Enhanced Hover Effects */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-purple-500/5 transition-all duration-700 pointer-events-none" />
      
      {/* Holographic Border Animation */}
      {isSelected && <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 p-0.5 opacity-50 animate-pulse">
          <div className="w-full h-full rounded-2xl bg-transparent" />
        </div>}
    </div>;
};
export default GlassMorphismSizeCard;

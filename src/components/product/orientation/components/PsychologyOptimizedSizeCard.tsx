
import { SizeOption } from "../types";
import { memo, useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, TrendingUp, Users, Eye, Sparkles, Heart } from "lucide-react";
import CanvasPreview from "./size-card/CanvasPreview";

interface PsychologyOptimizedSizeCardProps {
  option: SizeOption & { tier?: string; label?: string; isRecommended?: boolean };
  orientation: string;
  isSelected: boolean;
  userImageUrl: string | null;
  confidenceData: {
    roomFit: string;
    popularity: string;
    socialProof: string;
    lifestyle: string;
  };
  urgencyData: {
    viewers: number;
    recentOrders: number;
    timeFrame: string;
  };
  emotionalTriggers: string[];
  onClick: () => void;
  onContinue: (e: React.MouseEvent) => void;
}

const PsychologyOptimizedSizeCard = memo(({
  option,
  orientation,
  isSelected,
  userImageUrl,
  confidenceData,
  urgencyData,
  emotionalTriggers,
  onClick,
  onContinue
}: PsychologyOptimizedSizeCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showConfidenceData, setShowConfidenceData] = useState(false);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowConfidenceData(true);
    onClick();
  }, [onClick]);

  const handleContinueClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onContinue(e);
  }, [onContinue]);

  // Hero-level Premium Styling with Tier Psychology
  const cardStyles = useMemo(() => {
    const baseStyles = "relative group cursor-pointer transition-all duration-700 will-change-transform min-w-[320px] font-poppins overflow-hidden";
    
    if (isSelected) {
      return `${baseStyles} scale-110 -translate-y-6 z-50 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)]`;
    }
    
    if (option.tier === 'best') {
      return `${baseStyles} scale-105 -translate-y-3 z-40 hover:scale-110 hover:-translate-y-6 shadow-[0_30px_60px_-12px_rgba(147,51,234,0.35)]`;
    }
    
    if (option.tier === 'better' && option.isRecommended) {
      return `${baseStyles} scale-103 -translate-y-2 z-30 hover:scale-108 hover:-translate-y-4 shadow-[0_25px_50px_-12px_rgba(245,158,11,0.3)]`;
    }
    
    return `${baseStyles} hover:scale-105 hover:-translate-y-3 z-20 shadow-[0_20px_40px_-8px_rgba(0,0,0,0.15)]`;
  }, [isSelected, option.tier, option.isRecommended]);

  // Dynamic Multi-Layer Backgrounds with Tier Hierarchy
  const backgroundStyles = useMemo(() => {
    if (isSelected) {
      return 'bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15';
    }
    
    if (option.tier === 'best') {
      return 'bg-gradient-to-br from-primary/12 via-purple-500/8 to-violet-500/12';
    }
    
    if (option.tier === 'better' && option.isRecommended) {
      return 'bg-gradient-to-br from-amber-500/10 via-yellow-400/6 to-orange-500/10';
    }
    
    return 'bg-gradient-to-br from-background via-muted/50 to-background';
  }, [isSelected, option.tier, option.isRecommended]);

  // Tier-based border colors using semantic tokens
  const borderStyles = useMemo(() => {
    if (isSelected) {
      return 'border-primary border-3';
    }
    
    if (option.tier === 'best') {
      return 'border-primary/60 border-2';
    }
    
    if (option.tier === 'better' && option.isRecommended) {
      return 'border-amber-500/60 border-2';
    }
    
    return 'border-border/50 border';
  }, [isSelected, option.tier, option.isRecommended]);

  // Premium Floating Badges System
  const FloatingBadge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`absolute -top-3 -right-3 z-10 animate-bounce ${className}`}>
      {children}
    </div>
  );

  const getTierIcon = () => {
    switch (option.tier) {
      case 'best':
        return <Crown className="w-4 h-4" />;
      case 'better':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <div 
      className={cardStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="button" 
      tabIndex={0} 
      aria-pressed={isSelected} 
      aria-label={`Select ${option.size} size - ${option.label || option.tier}`}
    >
      {/* Hero-Level Premium Background with Multiple Layers */}
      <div className={`absolute inset-0 rounded-3xl transition-all duration-700 backdrop-blur-xl ${backgroundStyles} ${borderStyles}`} />
      
      {/* Animated Glow Effects */}
      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/20 blur-xl animate-pulse" />
          <div className="absolute inset-0 rounded-3xl border-2 border-primary/50 animate-ping" style={{ animationDuration: '3s' }} />
        </>
      )}
      
      {option.tier === 'best' && !isSelected && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/15 via-purple-500/10 to-violet-500/15 blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {option.isRecommended && option.tier === 'better' && !isSelected && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-orange-500/15 blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Floating Badge System for Recommendations */}
      {option.tier === 'best' && (
        <FloatingBadge className="premium-pulse">
          <Badge className="bg-gradient-to-r from-primary via-purple-600 to-violet-600 text-white font-bold shadow-2xl px-3 py-1">
            <Crown className="w-4 h-4 mr-1" />
            BEST VALUE
          </Badge>
        </FloatingBadge>
      )}
      
      {option.isRecommended && option.tier === 'better' && (
        <FloatingBadge className="glow-pulse">
          <Badge className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white font-bold shadow-2xl px-3 py-1">
            <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
            AI PICK
          </Badge>
        </FloatingBadge>
      )}

      {/* Content Container */}
      <div className="relative p-6 md:p-8 space-y-6">
        {/* Top Badges - Psychological Anchoring */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {option.isRecommended && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg animate-pulse">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Pick
              </Badge>
            )}
            
            {option.label && (
              <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 font-semibold">
                {getTierIcon()}
                <span className="ml-1">{option.label}</span>
              </Badge>
            )}
          </div>

          {/* Urgency Elements */}
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Eye className="w-3 h-3" />
            <span className="font-medium">{urgencyData.viewers} viewing</span>
          </div>
        </div>

        {/* Canvas Preview with enhanced hover effects */}
        <div className={`
          flex justify-center transition-all duration-500
          ${isSelected ? 'scale-110 drop-shadow-2xl' : 'group-hover:scale-105 group-hover:drop-shadow-xl'}
        `}>
          <CanvasPreview 
            orientation={orientation}
            userImageUrl={userImageUrl}
          />
        </div>

        {/* Size Information with emotional triggers */}
        <div className="text-center space-y-2">
          <h3 className={`
            text-2xl md:text-3xl font-bold font-poppins tracking-extra-tight drop-shadow-sm transition-colors duration-300
            ${isSelected ? 'text-purple-800' : option.isRecommended ? 'text-amber-800' : 'text-gray-800'}
          `}>
            {option.size}
          </h3>
          
          {/* Emotional Trigger Message */}
          <p className={`
            text-sm font-medium font-poppins tracking-tight transition-colors duration-300
            ${isSelected ? 'text-purple-600' : option.isRecommended ? 'text-amber-600' : 'text-gray-600'}
          `}>
            {emotionalTriggers[0]}
          </p>
        </div>

        {/* Enhanced Pricing with Psychology */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
              ${option.salePrice}
            </span>
            {option.originalPrice > option.salePrice && (
              <span className="text-lg text-gray-500 line-through font-poppins">${option.originalPrice}</span>
            )}
          </div>
          
          {option.originalPrice > option.salePrice && (
            <div className="bg-green-50 rounded-lg px-3 py-1 border border-green-200">
              <p className="text-sm text-green-700 font-bold font-poppins tracking-tight drop-shadow-sm">
                Save ${option.originalPrice - option.salePrice} • {Math.round(((option.originalPrice - option.salePrice) / option.originalPrice) * 100)}% Off
              </p>
            </div>
          )}
        </div>

        {/* Confidence Cascade Information */}
        <div className={`
          rounded-2xl p-4 text-center border backdrop-blur-sm transition-all duration-500 space-y-3
          ${isSelected
            ? 'bg-gradient-to-r from-purple-50/95 to-violet-50/80 border-purple-200/70 shadow-purple-100'
            : option.isRecommended
            ? 'bg-gradient-to-r from-amber-50/95 to-yellow-50/80 border-amber-200/70 shadow-amber-100'
            : 'bg-gradient-to-r from-slate-50/95 to-gray-50/80 border-slate-200/50 shadow-gray-100'
          }
        `}>
          <p className="text-sm font-medium font-poppins tracking-tight drop-shadow-sm">
            {confidenceData.roomFit}
          </p>
          
          {/* Progressive Information Revelation */}
          {(isHovered || isSelected || showConfidenceData) && (
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <Users className="w-3 h-3" />
                <span className="font-medium font-poppins">{confidenceData.popularity}</span>
              </div>
              
              <div className="text-xs text-gray-500 font-poppins">
                {urgencyData.recentOrders} orders in the {urgencyData.timeFrame}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Continue Button */}
        <div className={`
          transition-all duration-500 transform
          ${isSelected ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        `}>
          <Button 
            onClick={handleContinueClick} 
            className="w-full min-h-[60px] bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 text-white font-bold py-4 px-8 transition-all duration-300 border-0 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] text-base md:text-lg font-poppins tracking-tight drop-shadow-lg" 
            size="lg"
          >
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-bold">Perfect! Continue with {option.size}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </Button>
        </div>
      </div>

      {/* Enhanced selection effects */}
      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-3xl border-3 border-purple-400/70 pointer-events-none animate-pulse"></div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-400/20 via-violet-400/15 to-purple-400/20 blur-xl pointer-events-none animate-pulse"></div>
        </>
      )}
      
      {/* Recommended glow effect */}
      {option.isRecommended && !isSelected && (
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/20 via-yellow-400/15 to-amber-400/20 blur-lg pointer-events-none opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
    </div>
  );
});

PsychologyOptimizedSizeCard.displayName = 'PsychologyOptimizedSizeCard';

export default PsychologyOptimizedSizeCard;

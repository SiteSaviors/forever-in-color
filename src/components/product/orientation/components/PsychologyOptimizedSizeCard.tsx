
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

      {/* Revolutionary Content Container with Premium Interactions */}
      <div className="relative p-8 md:p-10 space-y-8 overflow-hidden">
        {/* Animated Particle Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
          <div className="absolute top-2/3 right-1/4 w-0.5 h-0.5 bg-secondary/50 rounded-full animate-ping" style={{ animationDelay: '1.5s', animationDuration: '5s' }}></div>
          <div className="absolute bottom-1/3 left-1/5 w-1.5 h-1.5 bg-accent/30 rounded-full animate-ping" style={{ animationDelay: '3s', animationDuration: '6s' }}></div>
        </div>
        
        {/* Glassmorphic Overlay Effect */}
        <div className="absolute inset-4 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl backdrop-blur-[2px] border border-white/20 opacity-60"></div>
        
        {/* Top Badges - Revolutionary Design with Micro-Interactions */}
        <div className="relative flex items-center justify-between z-10">
          <div className="flex gap-3">
            {option.isRecommended && (
              <Badge className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-bold shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse px-4 py-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="tracking-wider">AI CURATED</span>
                </div>
              </Badge>
            )}
            
            {option.label && (
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 font-bold hover:bg-primary/10 transition-all duration-300 transform hover:scale-105 px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  {getTierIcon()}
                  <span className="tracking-wide">{option.label}</span>
                </div>
              </Badge>
            )}
          </div>

          {/* Live Engagement Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20 backdrop-blur-sm">
            <div className="relative">
              <Eye className="w-4 h-4 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm font-bold text-primary">{urgencyData.viewers}</span>
            <span className="text-xs text-muted-foreground font-medium">live</span>
          </div>
        </div>

        {/* Canvas Preview with Revolutionary Hover System */}
        <div className="relative group/preview">
          {/* Preview Glow Ring */}
          <div className={`
            absolute inset-0 rounded-full transition-all duration-700 -m-4
            ${isSelected 
              ? 'bg-gradient-to-r from-primary/20 via-secondary/15 to-accent/20 blur-2xl scale-150' 
              : isHovered 
                ? 'bg-gradient-to-r from-primary/10 via-secondary/8 to-accent/10 blur-xl scale-125'
                : 'scale-100 opacity-0'
            }
          `}></div>
          
          <div className={`
            relative flex justify-center transition-all duration-700 transform-gpu
            ${isSelected 
              ? 'scale-125 drop-shadow-[0_25px_25px_rgba(0,0,0,0.25)] rotate-1' 
              : isHovered
                ? 'scale-115 drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)] -rotate-1'
                : 'group-hover/preview:scale-110 group-hover/preview:drop-shadow-xl'
            }
          `}>
            <div className="relative">
              <CanvasPreview 
                orientation={orientation}
                userImageUrl={userImageUrl}
              />
              {/* Magical Shimmer Effect */}
              {(isSelected || isHovered) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse opacity-60"></div>
              )}
            </div>
          </div>
        </div>

        {/* Size Information with Dynamic Typography */}
        <div className="text-center space-y-4 relative z-10">
          <div className="relative">
            <h3 className={`
              text-4xl md:text-5xl font-black font-poppins tracking-tighter transition-all duration-500
              ${isSelected 
                ? 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent transform scale-110' 
                : option.isRecommended 
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent'
                  : 'text-foreground'
              }
            `}>
              {option.size}
            </h3>
            
            {/* Dynamic Size Glow */}
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent blur-sm opacity-50 scale-110 pointer-events-none">
                {option.size}
              </div>
            )}
          </div>
          
          {/* Emotional Trigger with Animation */}
          <div className="relative overflow-hidden">
            <p className={`
              text-lg font-semibold font-poppins tracking-tight transition-all duration-500 transform
              ${isSelected 
                ? 'text-primary scale-105' 
                : option.isRecommended 
                  ? 'text-amber-700' 
                  : 'text-muted-foreground'
              }
            `}>
              {emotionalTriggers[0]}
            </p>
            
            {/* Underline Animation */}
            <div className={`
              h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-500 mx-auto
              ${isSelected ? 'w-full' : isHovered ? 'w-1/2' : 'w-0'}
            `}></div>
          </div>
        </div>

        {/* Revolutionary Pricing Display */}
        <div className="text-center space-y-4 relative">
          <div className="relative inline-block">
            <div className="flex items-center justify-center gap-4">
              <span className={`
                text-5xl md:text-6xl font-black font-poppins transition-all duration-500
                ${isSelected 
                  ? 'bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent scale-110' 
                  : 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent'
                }
              `}>
                ${option.salePrice}
              </span>
              {option.originalPrice > option.salePrice && (
                <div className="relative">
                  <span className="text-2xl text-muted-foreground line-through font-bold opacity-60">
                    ${option.originalPrice}
                  </span>
                  <div className="absolute inset-0 bg-red-500 h-0.5 rotate-12 top-1/2"></div>
                </div>
              )}
            </div>
            
            {/* Price Pulse Effect */}
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-xl animate-pulse scale-150 pointer-events-none"></div>
            )}
          </div>
          
          {option.originalPrice > option.salePrice && (
            <div className="relative">
              <div className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl px-6 py-3 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <p className="text-lg font-black font-poppins tracking-tight">
                  💰 SAVE ${option.originalPrice - option.salePrice} • {Math.round(((option.originalPrice - option.salePrice) / option.originalPrice) * 100)}% OFF
                </p>
              </div>
              
              {/* Savings Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 blur-lg rounded-2xl scale-110 opacity-75 pointer-events-none"></div>
            </div>
          )}
        </div>

        {/* Premium Confidence Section */}
        <div className="relative">
          <div className={`
            rounded-3xl p-6 text-center border-2 backdrop-blur-lg transition-all duration-700 space-y-4 relative overflow-hidden
            ${isSelected
              ? 'bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/15 border-primary/30 shadow-2xl transform scale-105'
              : option.isRecommended
                ? 'bg-gradient-to-br from-amber-500/15 via-yellow-400/10 to-orange-500/15 border-amber-500/30 shadow-xl'
                : 'bg-gradient-to-br from-background/80 via-muted/50 to-background/80 border-border/30 shadow-lg'
            }
          `}>
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
              <div className="absolute bottom-4 left-4 w-1 h-1 bg-secondary rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
            </div>
            
            <div className="relative z-10">
              <p className={`
                text-lg font-bold font-poppins tracking-tight transition-all duration-300
                ${isSelected ? 'text-primary' : 'text-foreground'}
              `}>
                {confidenceData.roomFit}
              </p>
              
              {/* Progressive Information with Stagger Animation */}
              {(isHovered || isSelected || showConfidenceData) && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <Users className="w-5 h-5 text-primary animate-pulse" />
                    <span className="text-base font-semibold">{confidenceData.popularity}</span>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-primary">
                      {urgencyData.recentOrders} recent orders • {urgencyData.timeFrame}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revolutionary Continue Button */}
        <div className={`
          transition-all duration-700 transform relative
          ${isSelected ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'}
        `}>
          <div className="relative group/button">
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent blur-xl opacity-75 group-hover/button:opacity-100 transition-opacity duration-300 scale-110"></div>
            
            <Button 
              onClick={handleContinueClick} 
              className="relative w-full min-h-[70px] bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white font-black py-6 px-8 transition-all duration-500 border-0 rounded-3xl shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transform hover:scale-[1.03] active:scale-[0.97] text-xl font-poppins tracking-tight overflow-hidden group/button" 
              size="lg"
            >
              {/* Button Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover/button:animate-pulse"></div>
              
              <div className="relative flex items-center justify-center gap-4">
                <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '2s' }} />
                <span className="font-black tracking-wide">Perfect! Continue with {option.size}</span>
                <ArrowRight className="w-6 h-6 group-hover/button:translate-x-2 transition-transform duration-300" />
              </div>
            </Button>
          </div>
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

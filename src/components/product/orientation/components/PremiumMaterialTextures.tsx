import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown } from "@/components/ui/icons";

interface PremiumMaterialTexturesProps {
  orientation: string;
  size: string;
  isSelected: boolean;
  className?: string;
}

const PremiumMaterialTextures = ({ 
  orientation, 
  size, 
  isSelected,
  className = ""
}: PremiumMaterialTexturesProps) => {
  const getCanvasTexture = () => {
    switch (orientation) {
      case 'square':
        return {
          background: `
            radial-gradient(circle at 1px 1px, rgba(139, 69, 19, 0.1) 1px, transparent 0),
            linear-gradient(45deg, rgba(245, 245, 220, 0.3) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(245, 245, 220, 0.3) 25%, transparent 25%)
          `,
          backgroundSize: '12px 12px, 8px 8px, 8px 8px'
        };
      case 'horizontal':
        return {
          background: `
            radial-gradient(circle at 0.8px 0.8px, rgba(139, 69, 19, 0.08) 1px, transparent 0),
            linear-gradient(90deg, rgba(245, 245, 220, 0.2) 50%, transparent 50%)
          `,
          backgroundSize: '10px 10px, 6px 6px'
        };
      case 'vertical':
        return {
          background: `
            radial-gradient(circle at 1.2px 1.2px, rgba(139, 69, 19, 0.12) 1px, transparent 0),
            linear-gradient(0deg, rgba(245, 245, 220, 0.25) 50%, transparent 50%)
          `,
          backgroundSize: '14px 14px, 7px 7px'
        };
      default:
        return {
          background: 'rgba(245, 245, 220, 0.1)',
          backgroundSize: '12px 12px'
        };
    }
  };

  const getWoodGrain = () => ({
    background: `
      linear-gradient(90deg, 
        rgba(139, 69, 19, 0.1) 0%, 
        rgba(160, 82, 45, 0.05) 20%, 
        rgba(139, 69, 19, 0.1) 40%,
        rgba(160, 82, 45, 0.05) 60%,
        rgba(139, 69, 19, 0.1) 80%,
        rgba(160, 82, 45, 0.05) 100%
      )`,
    backgroundSize: '40px 100%'
  });

  const canvasTexture = getCanvasTexture();
  const woodGrain = getWoodGrain();

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Canvas Texture Base */}
      <div 
        className="absolute inset-0 opacity-60"
        style={canvasTexture}
      />
      
      {/* Wood Frame Grain */}
      <div 
        className="absolute inset-0 opacity-30"
        style={woodGrain}
      />

      {/* Glass Morphism Overlay */}
      <div className={`absolute inset-0 transition-all duration-500 ${
        isSelected 
          ? 'bg-gradient-to-br from-white/20 via-purple-500/10 to-pink-500/20 backdrop-blur-sm' 
          : 'bg-gradient-to-br from-white/10 via-transparent to-white/5'
      }`} />

      {/* Premium Quality Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg backdrop-blur-sm">
            <Crown className="w-3 h-3 mr-1" />
            Museum Quality
          </Badge>
        </div>
      )}

      {/* Material Info */}
      <div className="absolute bottom-2 left-2 z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
          Premium Canvas • {size}
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
    </div>
  );
};

export default PremiumMaterialTextures;

import { AspectRatio } from "@/components/ui/aspect-ratio";
import PremiumMaterialTextures from "./PremiumMaterialTextures";
import SimpleCanvasPreview from "./SimpleCanvasPreview";
import CanvasBadges from "./CanvasBadges";
import CanvasOverlayEffects from "./CanvasOverlayEffects";
import CanvasImageDisplay from "./CanvasImageDisplay";
import { useCanvasPreview } from "./hooks/useCanvasPreview";

interface UnifiedCanvasPreviewProps {
  orientation: string;
  userImageUrl: string | null;
  size?: string;
  isSelected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
  variant?: 'interactive' | 'morphing' | 'simple';
}

const UnifiedCanvasPreview = ({
  orientation,
  userImageUrl,
  size = "16\" x 16\"",
  isSelected,
  isRecommended = false,
  onClick,
  variant = 'simple'
}: UnifiedCanvasPreviewProps) => {
  const { morphing, imageLoaded, getAspectRatio } = useCanvasPreview({
    orientation,
    userImageUrl,
    variant
  });

  // Simple variant for size cards
  if (variant === 'simple') {
    return <SimpleCanvasPreview orientation={orientation} userImageUrl={userImageUrl} />;
  }

  // Full interactive/morphing variant
  return (
    <div 
      className={`relative cursor-pointer group ${isSelected ? 'scale-105' : 'hover:scale-102'} transition-all duration-500 ${
        variant === 'morphing' && morphing ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      }`} 
      onClick={onClick} 
      role="button" 
      tabIndex={0} 
      aria-pressed={isSelected} 
      aria-label={`Select ${orientation} orientation`}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CanvasBadges isRecommended={isRecommended} isSelected={isSelected} />

      <AspectRatio ratio={getAspectRatio()} className="relative overflow-hidden rounded-xl">
        {/* Premium Material Textures for morphing variant */}
        {variant === 'morphing' && (
          <PremiumMaterialTextures 
            orientation={orientation} 
            size={size} 
            isSelected={isSelected} 
            className="absolute inset-0" 
          />
        )}

        {/* Canvas Frame and Image */}
        <CanvasImageDisplay
          orientation={orientation}
          userImageUrl={userImageUrl}
          variant={variant}
          imageLoaded={imageLoaded}
        />
        
        {/* Overlay Effects */}
        <CanvasOverlayEffects variant={variant} isSelected={isSelected} />
      </AspectRatio>
    </div>
  );
};

export default UnifiedCanvasPreview;

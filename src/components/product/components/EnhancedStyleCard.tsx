
import { useState } from "react";
import { Card } from "@/components/ui/card";
import EnhancedStyleCardBadges from "./EnhancedStyleCard/EnhancedStyleCardBadges";
import EnhancedStyleCardHoverActions from "./EnhancedStyleCard/EnhancedStyleCardHoverActions";
import EnhancedStyleCardInfoOverlay from "./EnhancedStyleCard/EnhancedStyleCardInfoOverlay";
import EnhancedStyleCardContent from "./EnhancedStyleCard/EnhancedStyleCardContent";
import EnhancedStyleCardLightboxes from "./EnhancedStyleCard/EnhancedStyleCardLightboxes";

interface EnhancedStyleCardProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  croppedImage: string | null;
  selectedStyle: number | null;
  isRecommended?: boolean;
  isPopular?: boolean;
  cropAspectRatio: number;
  selectedOrientation?: string;
  recommendationReason?: string;
  confidence?: number;
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

const EnhancedStyleCard = ({
  style,
  croppedImage,
  selectedStyle,
  isRecommended = false,
  isPopular = false,
  cropAspectRatio,
  selectedOrientation = "square",
  recommendationReason,
  confidence,
  onStyleClick,
  onContinue
}: EnhancedStyleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showCanvasPreview, setShowCanvasPreview] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const isSelected = selectedStyle === style.id;
  const imageToShow = croppedImage || style.image;

  const handleClick = () => {
    onStyleClick(style);
  };

  const handleCanvasPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCanvasPreview(true);
  };

  const handleLightboxOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLightbox(true);
  };

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  return (
    <>
      <Card
        className={`group cursor-pointer transition-all duration-500 overflow-hidden ${
          isSelected 
            ? 'ring-2 ring-purple-500 shadow-2xl scale-105' 
            : 'hover:shadow-2xl hover:scale-105'
        } ${
          isRecommended 
            ? 'border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50' 
            : 'bg-white'
        } ${
          isPressed ? 'scale-95' : ''
        }`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <div 
            className="relative bg-gray-100"
            style={{ aspectRatio: cropAspectRatio }}
          >
            <img
              src={imageToShow}
              alt={style.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Top Badges */}
            <EnhancedStyleCardBadges
              isRecommended={isRecommended}
              isPopular={isPopular}
              confidence={confidence}
            />

            {/* Hover Action Buttons */}
            <EnhancedStyleCardHoverActions
              isHovered={isHovered}
              onCanvasPreview={handleCanvasPreview}
              onLightboxOpen={handleLightboxOpen}
            />

            {/* Bottom Info Overlay */}
            <EnhancedStyleCardInfoOverlay
              isHovered={isHovered}
              styleName={style.name}
              styleDescription={style.description}
              confidence={confidence}
              recommendationReason={recommendationReason}
            />
          </div>
        </div>

        {/* Card Content */}
        <EnhancedStyleCardContent
          styleName={style.name}
          isSelected={isSelected}
          onContinue={onContinue}
        />

        {/* Selection Pulse Animation */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-purple-500 rounded-lg pointer-events-none">
            <div className="absolute inset-0 border-2 border-purple-400 rounded-lg animate-ping opacity-75"></div>
          </div>
        )}
      </Card>

      {/* Lightboxes */}
      <EnhancedStyleCardLightboxes
        showCanvasPreview={showCanvasPreview}
        showLightbox={showLightbox}
        imageToShow={imageToShow}
        styleName={style.name}
        selectedOrientation={selectedOrientation}
        onCloseCanvasPreview={() => setShowCanvasPreview(false)}
        onCloseLightbox={() => setShowLightbox(false)}
      />
    </>
  );
};

export default EnhancedStyleCard;


import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Maximize2, Sparkles, Crown, Users, Star } from "lucide-react";
import Lightbox from "@/components/ui/lightbox";
import FullCanvasMockup from "./FullCanvasMockup";

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

            {/* Top Badges - Enhanced */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
              <div className="flex flex-col gap-2">
                {isRecommended && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg animate-pulse">
                    <Crown className="w-3 h-3 mr-1" />
                    AI Pick
                  </Badge>
                )}
                {isPopular && !isRecommended && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold shadow-lg">
                    <Users className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>

              {confidence && (
                <Badge variant="secondary" className="bg-black/80 text-white border-0 backdrop-blur-sm">
                  <Star className="w-3 h-3 mr-1 text-amber-400" />
                  {Math.round(confidence * 100)}% Match
                </Badge>
              )}
            </div>

            {/* Enhanced Hover Action Buttons - Fixed positioning */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 z-10 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Subtle backdrop blur only behind buttons */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-2">
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/95 hover:bg-white backdrop-blur-sm shadow-xl border-0 transform transition-all duration-200 hover:scale-110"
                    onClick={handleCanvasPreview}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/95 hover:bg-white backdrop-blur-sm shadow-xl border-0 transform transition-all duration-200 hover:scale-110"
                    onClick={handleLightboxOpen}
                  >
                    <Maximize2 className="w-4 h-4 mr-1" />
                    Full Size
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Bottom Info Overlay - Improved positioning and readability */}
            <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 z-30 ${
              isHovered ? 'translate-y-0' : 'translate-y-full'
            }`}>
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-white/30">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900 text-sm md:text-base">{style.name}</h4>
                  {confidence && (
                    <div className="flex ml-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(confidence * 5)
                              ? 'text-amber-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs md:text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                  {style.description}
                </p>
                {recommendationReason && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <p className="text-xs text-amber-800 font-medium flex items-center">
                      <Sparkles className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="line-clamp-2">{recommendationReason}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Card Content */}
        <div className="p-4 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{style.name}</h4>
              {isSelected && (
                <Badge className="mt-2 bg-purple-600 text-white shadow-lg">
                  <Star className="w-3 h-3 mr-1" />
                  Selected
                </Badge>
              )}
            </div>
            
            {isSelected && onContinue && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 ml-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue();
                }}
              >
                Continue
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Selection Pulse Animation */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-purple-500 rounded-lg pointer-events-none">
            <div className="absolute inset-0 border-2 border-purple-400 rounded-lg animate-ping opacity-75"></div>
          </div>
        )}
      </Card>

      {/* Canvas Preview Lightbox */}
      <Lightbox
        isOpen={showCanvasPreview}
        onClose={() => setShowCanvasPreview(false)}
        imageSrc=""
        imageAlt={`${style.name} canvas preview`}
        title={`${style.name} on Canvas`}
        customContent={
          <FullCanvasMockup
            imageUrl={imageToShow}
            orientation={selectedOrientation}
            styleName={style.name}
          />
        }
      />

      {/* Full Size Lightbox */}
      <Lightbox
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        imageSrc={imageToShow}
        imageAlt={`${style.name} preview`}
        title={style.name}
      />
    </>
  );
};

export default EnhancedStyleCard;

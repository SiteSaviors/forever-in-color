
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Maximize2, Sparkles, Crown, Users } from "lucide-react";
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

  return (
    <>
      <Card
        className={`group cursor-pointer transition-all duration-500 overflow-hidden ${
          isSelected 
            ? 'ring-2 ring-purple-500 shadow-2xl scale-105' 
            : 'hover:shadow-xl hover:scale-105'
        } ${
          isRecommended 
            ? 'border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50' 
            : 'bg-white'
        }`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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

            {/* Gradient Overlay on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              <div className="flex flex-col gap-2">
                {isRecommended && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg">
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
                <Badge variant="secondary" className="bg-black/80 text-white border-0">
                  {Math.round(confidence * 100)}% Match
                </Badge>
              )}
            </div>

            {/* Hover Action Buttons */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="flex gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                  onClick={handleCanvasPreview}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                  onClick={handleLightboxOpen}
                >
                  <Maximize2 className="w-4 h-4 mr-1" />
                  Full Size
                </Button>
              </div>
            </div>

            {/* Bottom Info Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${
              isHovered ? 'translate-y-0' : 'translate-y-full'
            }`}>
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <h4 className="font-semibold text-gray-900 mb-1">{style.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{style.description}</p>
                {recommendationReason && (
                  <p className="text-xs text-amber-700 font-medium flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {recommendationReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card Content - Always Visible */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{style.name}</h4>
              {isSelected && (
                <Badge className="mt-1 bg-purple-600 text-white">
                  Selected
                </Badge>
              )}
            </div>
            
            {isSelected && onContinue && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
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

        {/* Selection Pulse Animation */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-purple-500 rounded-lg animate-pulse pointer-events-none" />
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

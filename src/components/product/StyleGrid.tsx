
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon } from "lucide-react";
import StyleCard from "./StyleCard";
import { artStyles } from "@/data/artStyles";

interface StyleGridProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  cropAspectRatio?: number;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const StyleGrid = ({ 
  croppedImage, 
  selectedStyle, 
  cropAspectRatio = 1,
  onStyleSelect, 
  onComplete 
}: StyleGridProps) => {
  const [loadingStyle, setLoadingStyle] = useState<number | null>(null);

  const handleStyleSelect = async (styleId: number, styleName: string) => {
    console.log('StyleGrid handleStyleSelect called:', styleId, styleName);
    setLoadingStyle(styleId);
    
    try {
      onStyleSelect(styleId, styleName);
    } finally {
      setLoadingStyle(null);
    }
  };

  // Show placeholder thumbnails when no photo is uploaded
  if (!croppedImage) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {artStyles.map((style) => (
            <div
              key={style.id}
              className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 aspect-square"
            >
              {/* Placeholder content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-gray-500" />
                </div>
                <p className="text-xs text-gray-600 font-medium mb-1">
                  Upload Photo to
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Preview Style
                </p>
              </div>

              {/* Style info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {style.name}
                </h4>
                <p className="text-xs text-gray-600 truncate">
                  {style.description}
                </p>
              </div>

              {/* Upload prompt overlay on hover */}
              <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Upload First
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show actual style cards when photo is uploaded
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {artStyles.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            croppedImage={croppedImage}
            selectedStyle={selectedStyle}
            isPopular={false}
            cropAspectRatio={cropAspectRatio}
            showContinueButton={false}
            onStyleClick={() => handleStyleSelect(style.id, style.name)}
          />
        ))}
      </div>

      {selectedStyle && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={onComplete}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Continue with Selected Style
          </Button>
        </div>
      )}
    </div>
  );
};

export default StyleGrid;

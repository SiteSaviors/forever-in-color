
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon } from "lucide-react";
import StyleCard from "./StyleCard";
import { artStyles } from "@/data/artStyles";

interface StyleGridProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  cropAspectRatio?: number;
  previewUrls?: { [key: number]: string };
  autoGenerationComplete?: boolean;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

const StyleGrid = ({ 
  croppedImage, 
  selectedStyle, 
  cropAspectRatio = 1,
  previewUrls = {},
  autoGenerationComplete = false,
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

  // Premium gradient backgrounds for each style (updated with more variety)
  const getStyleGradient = (styleId: number) => {
    const gradients = [
      'from-rose-400 via-orange-500 to-amber-500', // Original (ID: 1)
      'from-emerald-400 via-teal-500 to-cyan-600', // Classic Oil (ID: 2)
      'from-violet-400 via-purple-500 to-indigo-600', // Watercolor Dreams (ID: 4)
      'from-pink-300 via-rose-400 to-red-500', // Pastel Bliss (ID: 5)
      'from-lime-400 via-green-500 to-emerald-600', // Gemstone Poly (ID: 6)
      'from-sky-300 via-blue-400 to-indigo-500', // 3D Storybook (ID: 7)
      'from-amber-300 via-yellow-400 to-orange-500', // Artisan Charcoal (ID: 8)
      'from-fuchsia-400 via-pink-500 to-rose-600', // Pop Art Burst (ID: 9)
      'from-green-300 via-emerald-400 to-teal-500', // Neon Splash (ID: 10)
      'from-purple-300 via-violet-400 to-indigo-500', // Electric Bloom (ID: 11)
      'from-cyan-300 via-blue-400 to-indigo-500', // Abstract Fusion (ID: 13)
      'from-slate-400 via-gray-500 to-zinc-600', // Deco Luxe (ID: 15)
    ];
    
    // Map style IDs to gradient indices
    const styleIdToIndex: { [key: number]: number } = {
      1: 0, 2: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 13: 10, 15: 11
    };
    
    return gradients[styleIdToIndex[styleId]] || gradients[0];
  };

  // Show placeholder thumbnails when no photo is uploaded
  if (!croppedImage) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {artStyles.map((style) => (
            <div
              key={style.id}
              className="group relative bg-white rounded-xl overflow-hidden border-2 border-gray-200 aspect-square shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Premium glossy gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getStyleGradient(style.id)} opacity-90`}>
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20"></div>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
              </div>

              {/* Placeholder content - centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 border border-white/30">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white font-medium mb-1 drop-shadow-sm">
                  Upload Photo to
                </p>
                <p className="text-xs text-white font-medium drop-shadow-sm">
                  Preview Style
                </p>
              </div>

              {/* Style info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 border-t border-white/20">
                <h4 className="font-semibold text-sm text-white truncate">
                  {style.name}
                </h4>
                <p className="text-xs text-white/80 truncate">
                  {style.description}
                </p>
              </div>

              {/* Upload prompt overlay on hover */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-white/30 backdrop-blur-sm">
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
        {artStyles.map((style) => {
          // Check if this style has an auto-generated preview
          const hasAutoPreview = previewUrls[style.id];
          
          return (
            <StyleCard
              key={style.id}
              style={style}
              croppedImage={croppedImage}
              selectedStyle={selectedStyle}
              isPopular={[2, 4, 5].includes(style.id)} // Mark popular styles
              cropAspectRatio={cropAspectRatio}
              showContinueButton={true}
              preGeneratedPreview={hasAutoPreview ? previewUrls[style.id] : undefined}
              onStyleClick={() => handleStyleSelect(style.id, style.name)}
              onContinue={onComplete}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StyleGrid;


import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StyleCard from "./StyleCard";
import { artStyles } from "@/data/artStyles";

interface StyleGridProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  onStyleSelect: (styleId: number, styleName: string) => void;
}

const StyleGrid = ({ croppedImage, selectedStyle, onStyleSelect }: StyleGridProps) => {
  const [showAllStyles, setShowAllStyles] = useState(false);

  // Updated popular styles: Original Image, Watercolor Dreams, Pastel Bliss
  const popularStyleIds = [1, 4, 5];
  const popularStyles = artStyles.filter(style => popularStyleIds.includes(style.id));
  const otherStyles = artStyles.filter(style => !popularStyleIds.includes(style.id));
  const displayedStyles = showAllStyles ? artStyles : popularStyles;

  const handleStyleClick = (style: typeof artStyles[0]) => {
    onStyleSelect(style.id, style.name);
  };

  const handleSeeAllClick = () => {
    setShowAllStyles(true);
  };

  return (
    <>
      {/* Style Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayedStyles.map(style => (
          <StyleCard
            key={style.id}
            style={style}
            croppedImage={croppedImage}
            selectedStyle={selectedStyle}
            isPopular={popularStyleIds.includes(style.id)}
            onStyleClick={handleStyleClick}
          />
        ))}
        
        {/* Mobile "See All Styles" Card - Only show on mobile when not showing all styles */}
        {!showAllStyles && (
          <div 
            className="md:hidden cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={handleSeeAllClick}
          >
            <div className="aspect-square rounded-lg overflow-hidden relative group">
              {/* Glossy glass background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/80 via-pink-50/60 to-blue-50/40 backdrop-blur-sm border border-white/20 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-3 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Wand2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">See All Styles</h3>
                <p className="text-xs text-gray-600 leading-tight">Discover {otherStyles.length + popularStyles.length} amazing art styles</p>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Show More Styles Button - Only show on desktop when not showing all styles */}
      {!showAllStyles && (
        <div className="text-center hidden md:block">
          <Button 
            variant="outline"
            onClick={handleSeeAllClick}
            className="bg-white hover:bg-purple-50 border-purple-300 text-purple-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            See All {otherStyles.length} More Styles
          </Button>
        </div>
      )}
    </>
  );
};

export default StyleGrid;

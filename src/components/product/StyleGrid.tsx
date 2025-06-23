
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardContent } from "@/components/ui/card";
import StyleCard from "./StyleCard";
import { artStyles } from "@/data/artStyles";

interface StyleGridProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  cropAspectRatio?: number;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete?: () => void;
}

const StyleGrid = ({ 
  croppedImage, 
  selectedStyle, 
  cropAspectRatio = 1,
  onStyleSelect,
  onComplete
}: StyleGridProps) => {
  const [displayedBatches, setDisplayedBatches] = useState(1);
  
  // Start with popular styles: Original Image, Watercolor Dreams, Pastel Bliss
  const popularStyleIds = [1, 4, 5];
  const popularStyles = artStyles.filter(style => popularStyleIds.includes(style.id));
  const otherStyles = artStyles.filter(style => !popularStyleIds.includes(style.id));
  
  // Create batches: First batch is popular styles (3), then other styles in groups of 3
  const allBatches = [
    popularStyles, // First batch: 3 popular styles
    ...otherStyles.reduce<typeof artStyles[]>((batches, style, index) => {
      const batchIndex = Math.floor(index / 3);
      if (!batches[batchIndex]) {
        batches[batchIndex] = [];
      }
      batches[batchIndex].push(style);
      return batches;
    }, [])
  ];
  
  // Get styles to display based on number of batches shown
  const displayedStyles = allBatches.slice(0, displayedBatches).flat();
  const hasMoreStyles = displayedBatches < allBatches.length;
  const nextBatchSize = allBatches[displayedBatches]?.length || 0;

  const handleStyleClick = (style: typeof artStyles[0]) => {
    onStyleSelect(style.id, style.name);
  };

  const handleShowMore = () => {
    setDisplayedBatches(prev => prev + 1);
  };

  return (
    <>
      {/* Style Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {displayedStyles.map(style => (
          <StyleCard
            key={style.id}
            style={style}
            croppedImage={croppedImage}
            selectedStyle={selectedStyle}
            isPopular={popularStyleIds.includes(style.id)}
            cropAspectRatio={cropAspectRatio}
            showContinueButton={true}
            onStyleClick={handleStyleClick}
            onContinue={onComplete}
          />
        ))}
        
        {/* Show More Styles Card - Only show when there are more styles */}
        {hasMoreStyles && (
          <Card 
            className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
            onClick={handleShowMore}
          >
            <CardContent className="p-0">
              {/* Use same aspect ratio as other cards */}
              <AspectRatio ratio={cropAspectRatio} className="relative overflow-hidden rounded-t-lg">
                {/* Canvas Frame Effect matching other cards */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 p-2">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100/80 via-pink-50/60 to-blue-50/40 backdrop-blur-sm border border-white/20 shadow-lg rounded-sm flex items-center justify-center">
                    <div className="text-center p-3">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full p-2.5 mb-2 group-hover:scale-110 transition-transform duration-300 mx-auto w-fit">
                        <Wand2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        {displayedBatches === 1 ? 'More Styles' : 'Even More'}
                      </h3>
                      <p className="text-xs text-gray-600 leading-tight">
                        See {nextBatchSize} more amazing style{nextBatchSize !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
              </AspectRatio>

              {/* Style Info matching other cards */}
              <div className="p-2 md:p-3 space-y-1">
                <h5 className="font-semibold text-gray-900 text-sm">Discover More</h5>
                <p className="text-xs text-gray-600 leading-tight">
                  Unlock {nextBatchSize} additional art styles
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop Show More Styles Button - Alternative option on desktop */}
      {hasMoreStyles && (
        <div className="text-center hidden md:block">
          <Button 
            variant="outline"
            onClick={handleShowMore}
            className="bg-white hover:bg-purple-50 border-purple-300 text-purple-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Show {nextBatchSize} More Style{nextBatchSize !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </>
  );
};

export default StyleGrid;


import { useState } from "react";
import { Wand2, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { artStyles } from "@/data/artStyles";

interface StyleSelectorProps {
  croppedImage: string | null;
  selectedStyle: number | null;
  preSelectedStyle?: {id: number, name: string} | null;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
}

const StyleSelector = ({ 
  croppedImage, 
  selectedStyle, 
  preSelectedStyle, 
  onStyleSelect, 
  onComplete 
}: StyleSelectorProps) => {
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [loadingStyles, setLoadingStyles] = useState<Set<number>>(new Set());

  // Updated popular styles: Original Image, Watercolor Dreams, Pastel Bliss
  const popularStyleIds = [1, 4, 5]; // Original Image, Watercolor Dreams, Pastel Bliss
  const popularStyles = artStyles.filter(style => popularStyleIds.includes(style.id));
  const otherStyles = artStyles.filter(style => !popularStyleIds.includes(style.id));
  const displayedStyles = showAllStyles ? artStyles : popularStyles;

  const handleStyleClick = async (style: typeof artStyles[0]) => {
    if (!croppedImage) return;

    // If it's a popular style, it should already be available
    if (popularStyleIds.includes(style.id)) {
      onStyleSelect(style.id, style.name);
      return;
    }

    // For other styles, simulate loading
    setLoadingStyles(prev => new Set([...prev, style.id]));
    
    // Simulate API call delay
    setTimeout(() => {
      setLoadingStyles(prev => {
        const newSet = new Set(prev);
        newSet.delete(style.id);
        return newSet;
      });
      onStyleSelect(style.id, style.name);
    }, 1500);
  };

  const handleComplete = () => {
    console.log('StyleSelector handleComplete called', { croppedImage, selectedStyle });
    
    if (croppedImage && selectedStyle) {
      const style = artStyles.find(s => s.id === selectedStyle);
      if (style) {
        console.log('Calling onComplete with:', croppedImage, selectedStyle, style.name);
        onComplete(croppedImage, selectedStyle, style.name);
      } else {
        console.error('Style not found for selectedStyle:', selectedStyle);
      }
    } else {
      console.error('Missing required data for completion:', { croppedImage, selectedStyle });
    }
  };

  const renderStyleCard = (style: typeof artStyles[0]) => {
    const isSelected = selectedStyle === style.id;
    const isLoading = loadingStyles.has(style.id);
    const isPopular = popularStyleIds.includes(style.id);
    const canPreview = croppedImage && (isPopular || isLoading || isSelected);
    const isLocked = !croppedImage && !isPopular;

    return (
      <Card 
        key={style.id}
        className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
          isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
        } ${isLocked ? 'opacity-75' : ''}`}
        onClick={() => handleStyleClick(style)}
      >
        <CardContent className="p-0">
          {/* Square Preview */}
          <AspectRatio ratio={1} className="relative overflow-hidden rounded-t-lg">
            {canPreview ? (
              <div className="absolute inset-0">
                <img 
                  src={croppedImage!} 
                  alt="Style preview" 
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-br opacity-60 mix-blend-overlay`} 
                     style={{
                       background: style.id === 1 ? 'linear-gradient(to bottom right, #6b7280, #374151, #111827)' :
                                  style.id === 4 ? 'linear-gradient(to bottom right, #93c5fd, #c4b5fd, #f9a8d4)' :
                                  style.id === 5 ? 'linear-gradient(to bottom right, #fbbf24, #f59e0b, #f97316)' :
                                  style.id === 2 ? 'linear-gradient(to bottom right, #d97706, #ea580c, #dc2626)' :
                                  style.id === 10 ? 'linear-gradient(to bottom right, #a3e635, #ec4899, #a855f7)' :
                                  style.id === 7 ? 'linear-gradient(to bottom right, #a855f7, #ec4899, #ef4444)' :
                                  style.id === 9 ? 'linear-gradient(to bottom right, #ef4444, #fbbf24, #3b82f6)' :
                                  style.id === 11 ? 'linear-gradient(to bottom right, #ec4899, #a855f7, #06b6d4)' :
                                  style.id === 8 ? 'linear-gradient(to bottom right, #6b7280, #374151, #000000)' :
                                  style.id === 15 ? 'linear-gradient(to bottom right, #f59e0b, #d97706, #ea580c)' :
                                  'linear-gradient(to bottom right, #6b7280, #374151)'
                     }} />
                
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs font-medium">Creating preview...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0">
                <img 
                  src={style.image} 
                  alt={style.name} 
                  className="w-full h-full object-cover"
                />
                {isLocked && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-white text-center space-y-2 px-4">
                      <Lock className="w-6 h-6 mx-auto" />
                      <p className="text-xs font-medium leading-tight">Upload Your Photo to preview this style</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {isPopular && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold text-xs">
                  Popular
                </Badge>
              </div>
            )}
            
            {isSelected && !isLoading && (
              <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                <div className="bg-purple-600 text-white rounded-full p-2">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            )}
          </AspectRatio>

          {/* Style Info */}
          <div className="p-3 space-y-2">
            <h5 className="font-semibold text-gray-900 text-sm">{style.name}</h5>
            <p className="text-xs text-gray-600 leading-relaxed">{style.description}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-xl font-semibold text-gray-900 mb-2">
          Choose Your Art Style
        </h4>
        <p className="text-gray-600">
          {!croppedImage ? 
            "Here are all our incredible art styles. Upload your photo above to see live previews!" :
            "Click any style to see your photo transformed. Popular styles load instantly!"
          }
        </p>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {displayedStyles.map(renderStyleCard)}
      </div>

      {/* Show More Styles Button */}
      {!showAllStyles && (
        <div className="text-center">
          <Button 
            variant="outline"
            onClick={() => setShowAllStyles(true)}
            className="bg-white hover:bg-purple-50 border-purple-300 text-purple-700"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            See All {otherStyles.length} More Styles
          </Button>
        </div>
      )}

      {/* Continue Button */}
      {selectedStyle && (
        <div className="text-center pt-4">
          <Button 
            onClick={handleComplete}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Continue with {artStyles.find(s => s.id === selectedStyle)?.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StyleSelector;

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";

interface StylePreviewProps {
  uploadedImage: string | null;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
  preSelectedStyle?: {id: number, name: string} | null;
}

interface ArtStyle {
  id: number;
  name: string;
  description: string;
  popular: boolean;
  colors: string[];
  category: string;
}

const StylePreview = ({ uploadedImage, onStyleSelect, onComplete, preSelectedStyle }: StylePreviewProps) => {
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);

  // Set pre-selected style if provided
  useEffect(() => {
    if (preSelectedStyle) {
      setSelectedStyle(preSelectedStyle.id);
    }
  }, [preSelectedStyle]);

  const artStyles: ArtStyle[] = [
    {
      id: 1,
      name: "Original Image",
      description: "Your photo exactly as it is—printed in stunning clarity",
      popular: false,
      colors: ["from-gray-400", "via-gray-500", "to-gray-600"],
      category: "Natural"
    },
    {
      id: 2,
      name: "Classic Oil Painting",
      description: "Rich, textured brushstrokes reminiscent of traditional oil paintings",
      popular: true,
      colors: ["from-amber-600", "via-orange-700", "to-red-800"],
      category: "Classic"
    },
    {
      id: 3,
      name: "Calm WaterColor",
      description: "Soft, gentle watercolor washes with subtle color transitions and peaceful tones",
      popular: false,
      colors: ["from-blue-200", "via-teal-200", "to-green-200"],
      category: "Artistic"
    },
    {
      id: 4,
      name: "Watercolor Dreams",
      description: "Soft, flowing watercolor effects with gentle color bleeds",
      popular: true,
      colors: ["from-blue-300", "via-purple-300", "to-pink-300"],
      category: "Artistic"
    },
    {
      id: 5,
      name: "Pastel Bliss",
      description: "Gentle pastel hues with soft blends for a dreamy, calming feel",
      popular: false,
      colors: ["from-pink-200", "via-purple-200", "to-blue-200"],
      category: "Artistic"
    },
    {
      id: 6,
      name: "Crystalized Charm",
      description: "Faceted, gem-like texture with a modern, artistic twist",
      popular: false,
      colors: ["from-emerald-400", "via-teal-500", "to-blue-600"],
      category: "Modern"
    },
    {
      id: 7,
      name: "3D Storybook",
      description: "Bold, fun, and full of personality—like a scene from your favorite animated movie",
      popular: true,
      colors: ["from-purple-500", "via-pink-500", "to-red-500"],
      category: "Digital"
    },
    {
      id: 8,
      name: "Artisan Charcoal",
      description: "Soft, hand-drawn black-and-white sketch that looks like it came straight out of an artist's notebook",
      popular: false,
      colors: ["from-gray-600", "via-gray-800", "to-black"],
      category: "Classic"
    },
    {
      id: 9,
      name: "Pop Art Burst",
      description: "Bold, vibrant colors inspired by the classic pop art movement",
      popular: true,
      colors: ["from-red-500", "via-yellow-400", "to-blue-500"],
      category: "Retro"
    },
    {
      id: 10,
      name: "Neon Splash",
      description: "High-voltage color and explosive energy in every brushstroke",
      popular: false,
      colors: ["from-lime-400", "via-pink-500", "to-purple-600"],
      category: "Digital"
    },
    {
      id: 11,
      name: "Electric Bloom",
      description: "Futuristic cyberpunk aesthetic",
      popular: true,
      colors: ["from-pink-500", "via-purple-600", "to-cyan-400"],
      category: "Digital"
    },
    {
      id: 12,
      name: "Artistic Mashup",
      description: "A creative collision of styles—bold, expressive, and one of a kind",
      popular: false,
      colors: ["from-orange-400", "via-red-500", "to-purple-600"],
      category: "Creative"
    },
    {
      id: 13,
      name: "Modern Abstract",
      description: "Retro poster design style",
      popular: false,
      colors: ["from-teal-400", "via-blue-500", "to-indigo-600"],
      category: "Modern"
    },
    {
      id: 14,
      name: "Intricate Ink",
      description: "Detailed ink drawing with fine lines and flourishes of elegance",
      popular: false,
      colors: ["from-slate-600", "via-gray-700", "to-black"],
      category: "Classic"
    },
    {
      id: 15,
      name: "Deco Luxe",
      description: "Sophisticated Art Deco elegance with geometric patterns and luxurious metallic accents",
      popular: false,
      colors: ["from-amber-500", "via-yellow-600", "to-orange-700"],
      category: "Luxury"
    }
  ];

  const handleStyleClick = (style: ArtStyle) => {
    setSelectedStyle(style.id);
  };

  const handleSelectStyle = () => {
    if (selectedStyle) {
      const style = artStyles.find(s => s.id === selectedStyle);
      if (style) {
        onStyleSelect(selectedStyle, style.name);
        onComplete();
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Choose Your Art Style
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse our collection of 15 unique artistic styles. Select the one that speaks to you, then upload your photo to see the magic happen!
        </p>
        {preSelectedStyle && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-amber-800 font-medium">
              {preSelectedStyle.name} is already selected for you! You can change it below or continue to the next step.
            </p>
          </div>
        )}
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artStyles.map((style) => {
          const isSelected = selectedStyle === style.id;
          
          return (
            <Card 
              key={style.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
              }`}
              onClick={() => handleStyleClick(style)}
            >
              <CardContent className="p-0">
                {/* Preview Area */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <div className={`w-full h-full bg-gradient-to-br ${style.colors.join(' ')} opacity-80 flex items-center justify-center`}>
                    <div className="text-center text-white space-y-2">
                      <Wand2 className="w-8 h-8 mx-auto opacity-60" />
                      <p className="text-sm font-medium opacity-90">Preview Style</p>
                    </div>
                  </div>
                  
                  {/* Popular Badge */}
                  {style.popular && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold">
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-white/90 text-gray-700 border-gray-300">
                      {style.category}
                    </Badge>
                  </div>
                </div>

                {/* Style Info */}
                <div className="p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">{style.name}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{style.description}</p>
                  
                  {/* Color Indicators */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.colors[0]}`}></div>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.colors[1]}`}></div>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${style.colors[2]}`}></div>
                    </div>
                    
                    {isSelected && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Continue Button */}
      {selectedStyle && (
        <div className="text-center pt-6">
          <Button 
            onClick={handleSelectStyle}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Continue with {artStyles.find(s => s.id === selectedStyle)?.name}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StylePreview;

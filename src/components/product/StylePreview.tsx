
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";

interface StylePreviewProps {
  uploadedImage: string | null;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

interface ArtStyle {
  id: number;
  name: string;
  description: string;
  popular: boolean;
  colors: string[];
  category: string;
}

const StylePreview = ({ uploadedImage, onStyleSelect, onComplete }: StylePreviewProps) => {
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);

  const artStyles: ArtStyle[] = [
    {
      id: 1,
      name: "Original Image",
      description: "Keep your photo exactly as it is, with high-quality printing",
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
      name: "Watercolor Dreams",
      description: "Soft, flowing watercolor effects with gentle color bleeds",
      popular: true,
      colors: ["from-blue-300", "via-purple-300", "to-pink-300"],
      category: "Artistic"
    },
    {
      id: 4,
      name: "Geometric Grace",
      description: "Modern geometric patterns with clean lines and bold shapes",
      popular: false,
      colors: ["from-teal-400", "via-blue-500", "to-indigo-600"],
      category: "Modern"
    },
    {
      id: 5,
      name: "3D Stylized",
      description: "Three-dimensional effect with depth and modern digital styling",
      popular: true,
      colors: ["from-purple-500", "via-pink-500", "to-red-500"],
      category: "Digital"
    },
    {
      id: 6,
      name: "Artisan Charcoal",
      description: "Hand-drawn charcoal sketch with dramatic shadows and highlights",
      popular: false,
      colors: ["from-gray-600", "via-gray-800", "to-black"],
      category: "Classic"
    },
    {
      id: 7,
      name: "Vintage Pop Art",
      description: "Bold, vibrant colors inspired by classic pop art movement",
      popular: true,
      colors: ["from-red-500", "via-yellow-400", "to-blue-500"],
      category: "Retro"
    },
    {
      id: 8,
      name: "Neon Splash",
      description: "Explosive neon colors with dynamic splashes and bursts",
      popular: false,
      colors: ["from-lime-400", "via-pink-500", "to-purple-600"],
      category: "Digital"
    },
    {
      id: 9,
      name: "Neon Glow",
      description: "Retro-futuristic vibes with electric colors and cyberpunk aesthetics",
      popular: true,
      colors: ["from-pink-500", "via-purple-600", "to-cyan-400"],
      category: "Digital"
    },
    {
      id: 10,
      name: "Artistic Mashup",
      description: "Creative blend of multiple artistic styles in one unique piece",
      popular: false,
      colors: ["from-orange-400", "via-red-500", "to-purple-600"],
      category: "Creative"
    },
    {
      id: 11,
      name: "Crafted Embroidery",
      description: "Detailed embroidery style with textile textures and patterns",
      popular: false,
      colors: ["from-rose-400", "via-pink-500", "to-red-500"],
      category: "Textile"
    },
    {
      id: 12,
      name: "Soft Pastel",
      description: "Gentle pastel colors with dreamy, ethereal quality",
      popular: true,
      colors: ["from-pink-200", "via-purple-200", "to-blue-200"],
      category: "Artistic"
    },
    {
      id: 13,
      name: "100-Photo Mosaic",
      description: "Your image recreated using 100 smaller photos in mosaic style",
      popular: false,
      colors: ["from-emerald-400", "via-teal-500", "to-blue-600"],
      category: "Creative"
    },
    {
      id: 14,
      name: "Intricate Ink",
      description: "Detailed ink drawing with fine lines and artistic flourishes",
      popular: false,
      colors: ["from-slate-600", "via-gray-700", "to-black"],
      category: "Classic"
    },
    {
      id: 15,
      name: "Elegant Vintage",
      description: "Timeless vintage aesthetic with aged, sophisticated charm",
      popular: false,
      colors: ["from-amber-500", "via-yellow-600", "to-orange-700"],
      category: "Retro"
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


import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Wand2 } from "lucide-react";

interface StylePreviewProps {
  uploadedImage: string;
  onStyleSelect: (styleId: number, styleName: string) => void;
  onComplete: () => void;
}

interface ArtStyle {
  id: number;
  name: string;
  description: string;
  popular: boolean;
  colors: string[];
  prompt: string;
  previewUrl?: string;
  isGenerating?: boolean;
}

const StylePreview = ({ uploadedImage, onStyleSelect, onComplete }: StylePreviewProps) => {
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);
  const [generatedPreviews, setGeneratedPreviews] = useState<Record<number, string>>({});
  const [generatingStyles, setGeneratingStyles] = useState<Set<number>>(new Set());

  const artStyles: ArtStyle[] = [
    {
      id: 1,
      name: "Watercolor Dreams",
      description: "Soft, flowing watercolor effects with gentle color bleeds",
      popular: true,
      colors: ["from-blue-300", "via-purple-300", "to-pink-300"],
      prompt: "watercolor painting, soft brushstrokes, flowing colors"
    },
    {
      id: 2,
      name: "Neon Synthwave",
      description: "Retro-futuristic vibes with electric colors and cyberpunk aesthetics",
      popular: true,
      colors: ["from-pink-500", "via-purple-600", "to-cyan-400"],
      prompt: "neon synthwave art, cyberpunk style, electric colors"
    },
    {
      id: 3,
      name: "Pop Art Burst",
      description: "Bold, vibrant colors inspired by classic pop art movement",
      popular: true,
      colors: ["from-red-500", "via-yellow-400", "to-blue-500"],
      prompt: "pop art style, bold colors, comic book aesthetic"
    },
    {
      id: 4,
      name: "Oil Painting Classic",
      description: "Rich, textured brushstrokes reminiscent of traditional oil paintings",
      popular: false,
      colors: ["from-amber-600", "via-orange-700", "to-red-800"],
      prompt: "oil painting, classical portrait, rich textures"
    },
    {
      id: 5,
      name: "Minimalist Line",
      description: "Clean, elegant line art with sophisticated simplicity",
      popular: false,
      colors: ["from-gray-600", "via-gray-800", "to-black"],
      prompt: "minimalist line art, clean lines, simple elegant"
    },
    {
      id: 6,
      name: "Digital Glitch",
      description: "Modern digital art with glitch effects and pixel distortion",
      popular: false,
      colors: ["from-green-400", "via-blue-500", "to-purple-600"],
      prompt: "digital glitch art, pixel distortion, cyberpunk"
    }
  ];

  // Simulate AI style generation (replace with actual API call)
  const generateStylePreview = async (style: ArtStyle) => {
    setGeneratingStyles(prev => new Set(prev).add(style.id));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // For demo: create a filtered version of the original image
    // In production, this would call your AI API with the uploaded image and style prompt
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise<string>((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        // Apply demo filter based on style
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Apply different filters based on style
          if (style.id === 1) { // Watercolor
            for (let i = 0; i < data.length; i += 4) {
              data[i] = Math.min(255, data[i] * 1.2);     // Red
              data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
              data[i + 2] = Math.min(255, data[i + 2] * 1.3); // Blue
            }
          } else if (style.id === 2) { // Neon
            for (let i = 0; i < data.length; i += 4) {
              data[i] = Math.min(255, data[i] * 1.5);     // Red
              data[i + 1] = Math.min(255, data[i + 1] * 0.8); // Green
              data[i + 2] = Math.min(255, data[i + 2] * 1.8); // Blue
            }
          } else if (style.id === 3) { // Pop Art
            for (let i = 0; i < data.length; i += 4) {
              data[i] = data[i] > 128 ? 255 : 0;     // Red
              data[i + 1] = data[i + 1] > 128 ? 255 : 0; // Green
              data[i + 2] = data[i + 2] > 128 ? 255 : 0; // Blue
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
        }
        
        const previewUrl = canvas.toDataURL();
        setGeneratedPreviews(prev => ({ ...prev, [style.id]: previewUrl }));
        setGeneratingStyles(prev => {
          const newSet = new Set(prev);
          newSet.delete(style.id);
          return newSet;
        });
        resolve(previewUrl);
      };
      img.src = uploadedImage;
    });
  };

  // Auto-generate popular styles on component mount
  useEffect(() => {
    const popularStyles = artStyles.filter(style => style.popular);
    popularStyles.forEach(style => {
      generateStylePreview(style);
    });
  }, [uploadedImage]);

  const handleStyleClick = async (style: ArtStyle) => {
    setSelectedStyle(style.id);
    
    // Generate preview if not already generated
    if (!generatedPreviews[style.id] && !generatingStyles.has(style.id)) {
      await generateStylePreview(style);
    }
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
          We're automatically generating previews in our most popular styles. Click any style to see your photo transformed!
        </p>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artStyles.map((style) => {
          const isSelected = selectedStyle === style.id;
          const isGenerating = generatingStyles.has(style.id);
          const hasPreview = generatedPreviews[style.id];
          
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
                  {hasPreview ? (
                    <img 
                      src={generatedPreviews[style.id]} 
                      alt={`${style.name} preview`}
                      className="w-full h-full object-cover"
                    />
                  ) : isGenerating ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-purple-600 font-medium">Generating...</p>
                      </div>
                    </div>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${style.colors.join(' ')} opacity-80 flex items-center justify-center`}>
                      <div className="text-center text-white space-y-2">
                        <Wand2 className="w-8 h-8 mx-auto opacity-60" />
                        <p className="text-sm font-medium opacity-90">Click to Preview</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Popular Badge */}
                  {style.popular && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold">
                        Popular
                      </Badge>
                    </div>
                  )}
                  
                  {/* Generating Badge */}
                  {isGenerating && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-purple-600 text-white">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                        Generating
                      </Badge>
                    </div>
                  )}
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

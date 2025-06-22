
import { useState, useCallback } from "react";
import { Upload, Check, X, Image as ImageIcon, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PhotoUploadAndStyleSelectionProps {
  onComplete: (imageUrl: string, styleId: number, styleName: string) => void;
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

const PhotoUploadAndStyleSelection = ({ onComplete, preSelectedStyle }: PhotoUploadAndStyleSelectionProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<number | null>(preSelectedStyle?.id || null);
  const [showAllStyles, setShowAllStyles] = useState(false);

  const artStyles: ArtStyle[] = [
    {
      id: 2,
      name: "Classic Oil Painting",
      description: "Rich, textured brushstrokes reminiscent of traditional oil paintings",
      popular: true,
      colors: ["from-amber-600", "via-orange-700", "to-red-800"],
      category: "Classic"
    },
    {
      id: 10,
      name: "Neon Splash",
      description: "High-voltage color and explosive energy in every brushstroke",
      popular: true,
      colors: ["from-lime-400", "via-pink-500", "to-purple-600"],
      category: "Digital"
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
      id: 4,
      name: "Watercolor Dreams",
      description: "Soft, flowing watercolor effects with gentle color bleeds",
      popular: false,
      colors: ["from-blue-300", "via-purple-300", "to-pink-300"],
      category: "Artistic"
    },
    {
      id: 9,
      name: "Pop Art Burst",
      description: "Bold, vibrant colors inspired by the classic pop art movement",
      popular: false,
      colors: ["from-red-500", "via-yellow-400", "to-blue-500"],
      category: "Retro"
    },
    {
      id: 11,
      name: "Electric Bloom",
      description: "Futuristic cyberpunk aesthetic",
      popular: false,
      colors: ["from-pink-500", "via-purple-600", "to-cyan-400"],
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
      id: 15,
      name: "Deco Luxe",
      description: "Sophisticated Art Deco elegance with geometric patterns and luxurious metallic accents",
      popular: false,
      colors: ["from-amber-500", "via-yellow-600", "to-orange-700"],
      category: "Luxury"
    }
  ];

  const popularStyles = artStyles.filter(style => style.popular);
  const displayedStyles = showAllStyles ? artStyles : popularStyles;

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewUrl(imageUrl);
      setUploadedFile(file);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setSelectedStyle(null);
  };

  const handleStyleClick = (style: ArtStyle) => {
    setSelectedStyle(style.id);
  };

  const handleComplete = () => {
    if (previewUrl && selectedStyle) {
      const style = artStyles.find(s => s.id === selectedStyle);
      if (style) {
        onComplete(previewUrl, selectedStyle, style.name);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Upload Your Photo & Choose Your Style
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your photo first, then see it transformed into stunning art styles. We'll show you previews using your actual photo!
        </p>
      </div>

      {/* Upload Section */}
      {!uploadedFile ? (
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
            ${isDragging 
              ? 'border-purple-400 bg-purple-50 scale-105' 
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className={`
              w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300
              ${isDragging ? 'bg-purple-200' : 'bg-gray-100'}
            `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-purple-600' : 'text-gray-400'}`} />
            </div>
            
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Drop your photo here, or click to browse
              </h4>
              <p className="text-gray-500">
                Supports JPG, PNG, HEIC • Max 10MB
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4 bg-white hover:bg-purple-50 border-purple-300 text-purple-700"
            >
              Choose File
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Photo Preview */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={previewUrl!} 
                    alt="Uploaded preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      {uploadedFile.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="w-4 h-4" />
                    <span className="font-medium text-sm">Photo uploaded! Now choose your style below.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Style Selection */}
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                See Your Photo as Art
              </h4>
              <p className="text-gray-600">
                Here are our most popular styles with your photo. Click any style to see more options.
              </p>
            </div>

            {/* Style Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {displayedStyles.map((style) => {
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
                      {/* Preview with User's Photo */}
                      <div className="relative h-32 md:h-40 overflow-hidden rounded-t-lg">
                        <div className="absolute inset-0">
                          <img 
                            src={previewUrl!} 
                            alt="Style preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-br ${style.colors.join(' ')} opacity-60 mix-blend-overlay`} />
                        </div>
                        
                        {style.popular && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold text-xs">
                              Popular
                            </Badge>
                          </div>
                        )}
                        
                        {isSelected && (
                          <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                            <div className="bg-purple-600 text-white rounded-full p-2">
                              <Check className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Style Info */}
                      <div className="p-3 space-y-2">
                        <h5 className="font-semibold text-gray-900 text-sm">{style.name}</h5>
                        <p className="text-xs text-gray-600 leading-relaxed">{style.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                  See All {artStyles.length - popularStyles.length} More Styles
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
        </div>
      )}

      {/* Upload Tips */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Tips for Best Results</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Use high-resolution photos (at least 1000x1000px)</li>
          <li>• Ensure good lighting and clear focal points</li>
          <li>• Avoid heavily filtered or edited photos</li>
          <li>• Group photos work best with 2-4 people</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUploadAndStyleSelection;

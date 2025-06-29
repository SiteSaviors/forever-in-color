
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface StylePreviewProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  isSelected: boolean;
  isGenerating: boolean;
  previewUrl?: string;
  onSelect: () => void;
  onGenerate: () => void;
}

const StylePreview = ({ 
  style, 
  isSelected, 
  isGenerating, 
  previewUrl, 
  onSelect, 
  onGenerate 
}: StylePreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageToShow = previewUrl || style.image;

  return (
    <Card className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
    }`}>
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <img
            src={imageToShow}
            alt={style.name}
            className={`w-full h-full object-cover rounded-t-lg transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onClick={onSelect}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-lg" />
          )}

          {isGenerating && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Generating...</p>
              </div>
            </div>
          )}

          {previewUrl && (
            <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
              <Sparkles className="w-3 h-3 mr-1" />
              Generated
            </Badge>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{style.name}</h3>
          <p className="text-gray-600 text-sm mb-3">{style.description}</p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={onSelect}
              className="flex-1"
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
            
            {!previewUrl && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onGenerate}
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StylePreview;

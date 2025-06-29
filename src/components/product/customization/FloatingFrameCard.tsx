
import { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Frame, Sparkles, Eye } from "lucide-react";

interface FloatingFrameCardProps {
  isSelected: boolean;
  onToggle: () => void;
  price: number;
}

const FloatingFrameCard = memo(({
  isSelected,
  onToggle,
  price
}: FloatingFrameCardProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const benefits = [
    "Modern floating appearance",
    "Premium wooden backing",
    "Ready to hang hardware included",
    "Adds 3D depth to your artwork"
  ];

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${
      isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-md'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Frame className="w-5 h-5 text-purple-600" />
            Floating Frame
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium
            </Badge>
            <Badge variant="outline">+${price}</Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Elevate your artwork with a modern floating frame that adds elegant depth
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant={isSelected ? "default" : "outline"}
            onClick={onToggle}
            className="flex-1"
          >
            {isSelected ? "Selected" : "Add Frame"}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="px-3"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {showPreview && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 text-sm">Frame Preview</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

FloatingFrameCard.displayName = 'FloatingFrameCard';

export default FloatingFrameCard;

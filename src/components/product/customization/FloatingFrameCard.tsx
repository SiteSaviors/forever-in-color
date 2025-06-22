import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Frame } from "lucide-react";

interface FloatingFrameCardProps {
  enabled: boolean;
  color: 'white' | 'black' | 'espresso';
  selectedSize: string;
  onEnabledChange: (enabled: boolean) => void;
  onColorChange: (color: 'white' | 'black' | 'espresso') => void;
}

const frameOptions = {
  white: {
    name: 'White',
    bgColor: 'bg-white',
    description: 'Clean, minimalist look',
    price: '+ $79.99'
  },
  black: {
    name: 'Black',
    bgColor: 'bg-black',
    description: 'Bold, modern contrast',
    price: '+ $79.99'
  },
  espresso: {
    name: 'Espresso',
    bgColor: 'bg-gradient-to-br from-amber-800 to-amber-600',
    description: 'Warm, sophisticated tone',
    price: '+ $89.99'
  }
};

const FloatingFrameCard = ({ 
  enabled, 
  color, 
  selectedSize, 
  onEnabledChange, 
  onColorChange 
}: FloatingFrameCardProps) => {
  const getFramePreview = (frameColor: string) => {
    const baseClasses = "rounded-md shadow-md flex items-center justify-center";
    const textClasses = "text-gray-700 font-medium text-xs";
  
    switch (frameColor) {
      case 'white':
        return (
          <div className="bg-white p-1">
            <div className={`${baseClasses} bg-gray-50 h-16 w-24`}>
              <span className={textClasses}>
                {selectedSize.replace(/"/g, '')}
              </span>
            </div>
          </div>
        );
      case 'black':
        return (
          <div className="bg-black p-1">
            <div className={`${baseClasses} bg-gray-50 h-16 w-24`}>
              <span className={textClasses}>
                {selectedSize.replace(/"/g, '')}
              </span>
            </div>
          </div>
        );
      case 'espresso':
        return (
          <div className="bg-gradient-to-br from-amber-800 to-amber-600 p-1">
            <div className={`${baseClasses} bg-gray-50 h-16 w-24`}>
              <span className={textClasses}>
                {selectedSize.replace(/"/g, '')}
              </span>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white p-1">
            <div className={`${baseClasses} bg-gray-50 h-16 w-24`}>
              <span className={textClasses}>
                {selectedSize.replace(/"/g, '')}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className={`group transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
      enabled 
        ? 'ring-2 ring-teal-200 shadow-xl bg-gradient-to-r from-teal-50/50 to-cyan-50/50 border-l-4 border-l-teal-400' 
        : 'shadow-lg hover:shadow-teal-100/50'
    }`}>
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              enabled 
                ? 'bg-teal-100 text-teal-600 animate-slide-in' 
                : 'bg-gray-100 text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-400'
            }`}>
              <Frame className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h5 className="text-xl font-bold text-gray-900 font-poppins tracking-tight">Add Floating Frame</h5>
                <Badge className="bg-teal-100 text-teal-700 font-semibold px-3 py-1">
                  {frameOptions[color].price}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  Most Popular
                </Badge>
              </div>
              <p className="text-gray-600 text-base leading-relaxed mb-2">
                Give your canvas a sophisticated floating appearance with a premium handcrafted frame
              </p>
              <p className="text-sm text-teal-600 font-medium">
                🖼️ Museum-quality mounting • Ready to hang
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            className="data-[state=checked]:bg-teal-500"
          />
        </div>

        {/* Frame Color Options */}
        {enabled && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-l-teal-300 animate-slide-in">
            <h6 className="text-sm font-semibold text-gray-700 mb-3 font-poppins tracking-tight">Choose Frame Color:</h6>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(frameOptions).map(([frameColor, option]) => (
                <div
                  key={frameColor}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    color === frameColor
                      ? 'border-teal-400 bg-teal-50 shadow-md'
                      : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
                  }`}
                  onClick={() => onColorChange(frameColor as 'white' | 'black' | 'espresso')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded border ${option.bgColor}`} />
                    <span className="text-sm font-medium font-poppins tracking-tight">{option.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                  <div className="text-sm font-semibold text-teal-600 mt-1">{option.price}</div>
                </div>
              ))}
            </div>

            {/* Frame Preview */}
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <p className="text-sm text-gray-600 mb-2 font-poppins tracking-tight">Preview with your {selectedSize}:</p>
              {getFramePreview(color)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FloatingFrameCard;

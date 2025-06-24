
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

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
            <div className={`${baseClasses} bg-gray-50 h-12 md:h-16 w-16 md:w-24`}>
              <span className={textClasses}>
                {selectedSize.replace(/"/g, '')}
              </span>
            </div>
          </div>
        );
      case 'black':
        return (
          <div className="bg-black p-1">
            <div className={`${baseClasses} bg-gray-50 h-12 md:h-16 w-16 md:w-24`}>
              <span className={textClasses}>
                {selectedSize.replace(/"/g, '')}
              </span>
            </div>
          </div>
        );
      case 'espresso':
        return (
          <div className="bg-gradient-to-br from-amber-800 to-amber-600 p-1">
            <div className={`${baseClasses} bg-gray-50 h-12 md:h-16 w-16 md:w-24`}>
              <span className={textClasses}>
                {selectedSize.replace(/"/g, '')}
              </span>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white p-1">
            <div className={`${baseClasses} bg-gray-50 h-12 md:h-16 w-16 md:w-24`}>
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
      <CardContent className="p-4 md:p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 md:gap-4 flex-1">
            <div className={`p-2 md:p-3 rounded-xl transition-all duration-300 ${
              enabled 
                ? 'bg-teal-100 text-teal-600 animate-slide-in' 
                : 'bg-gray-100 text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-400'
            }`}>
              <img 
                src="/lovable-uploads/b1b4a289-ef16-4ac2-87b2-c5bed1dae005.png" 
                alt="Floating frame icon" 
                className="w-5 h-5 md:w-6 md:h-6"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <h5 className="text-lg md:text-xl font-bold text-gray-900 font-poppins tracking-tight">Add Floating Frame</h5>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-teal-100 text-teal-700 font-semibold px-2 md:px-3 py-1 text-xs">
                    {frameOptions[color].price}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-xs">
                    Most Popular
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-2">
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
            className="data-[state=checked]:bg-teal-500 ml-2"
          />
        </div>

        {/* Frame Color Options */}
        {enabled && (
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg border-l-4 border-l-teal-300 animate-slide-in">
            <h6 className="text-sm font-semibold text-gray-700 mb-2 md:mb-3 font-poppins tracking-tight">Choose Frame Color:</h6>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {Object.entries(frameOptions).map(([frameColor, option]) => (
                <div
                  key={frameColor}
                  className={`p-2 md:p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    color === frameColor
                      ? 'border-teal-400 bg-teal-50 shadow-md'
                      : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
                  }`}
                  onClick={() => onColorChange(frameColor as 'white' | 'black' | 'espresso')}
                >
                  <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                    <div className={`w-3 h-3 md:w-4 md:h-4 rounded border ${option.bgColor}`} />
                    <span className="text-xs md:text-sm font-medium font-poppins tracking-tight">{option.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{option.description}</div>
                  <div className="text-xs md:text-sm font-semibold text-teal-600">{option.price}</div>
                </div>
              ))}
            </div>

            {/* Frame Preview */}
            <div className="mt-3 md:mt-4 p-2 md:p-3 bg-white rounded-lg border">
              <p className="text-xs md:text-sm text-gray-600 mb-2 font-poppins tracking-tight">Preview with your {selectedSize}:</p>
              <img 
                src="/lovable-uploads/48e1dd7b-3bb0-414e-b325-32cb20493807.png" 
                alt="Floating frame preview" 
                className="w-full h-auto rounded shadow-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FloatingFrameCard;

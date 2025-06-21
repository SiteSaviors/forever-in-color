
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OrientationOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface SizeOption {
  size: string;
  category: string;
  description: string;
  popular?: boolean;
}

interface OrientationSelectorProps {
  selectedOrientation: string;
  selectedSize: string;
  onOrientationChange: (orientation: string) => void;
  onSizeChange: (size: string) => void;
}

const OrientationSelector = ({ 
  selectedOrientation, 
  selectedSize,
  onOrientationChange, 
  onSizeChange 
}: OrientationSelectorProps) => {
  const orientationOptions: OrientationOption[] = [
    { 
      id: "horizontal", 
      name: "Horizontal", 
      description: "Perfect for landscapes and wide shots",
      icon: "🖼️"
    },
    { 
      id: "vertical", 
      name: "Vertical", 
      description: "Ideal for portraits and tall compositions",
      icon: "🎨"
    },
    { 
      id: "square", 
      name: "Square", 
      description: "Great for Instagram photos and symmetric art",
      icon: "⬜"
    }
  ];

  const sizeOptions: Record<string, SizeOption[]> = {
    horizontal: [
      { size: '16" x 12"', category: 'XS', description: 'Great for desks or shelves', popular: false },
      { size: '24" x 18"', category: 'S', description: 'Nice fit for entryways or nooks', popular: true },
      { size: '36" x 24"', category: 'M', description: 'Perfect for bedrooms or offices', popular: false },
      { size: '40" x 30"', category: 'L', description: 'Bold accent for any room', popular: false },
      { size: '48" x 32"', category: 'XL', description: 'Ideal for living rooms or large walls', popular: false },
      { size: '60" x 40"', category: 'XXL', description: 'Gallery-size showstopper', popular: false }
    ],
    vertical: [
      { size: '12" x 16"', category: 'XS', description: 'Great for desks or shelves', popular: false },
      { size: '18" x 24"', category: 'S', description: 'Nice fit for entryways or nooks', popular: true },
      { size: '24" x 36"', category: 'M', description: 'Perfect for bedrooms or offices', popular: false },
      { size: '30" x 40"', category: 'L', description: 'Bold accent for any room', popular: false },
      { size: '32" x 48"', category: 'XL', description: 'Ideal for living rooms or large walls', popular: false },
      { size: '40" x 60"', category: 'XXL', description: 'Gallery-size showstopper', popular: false }
    ],
    square: [
      { size: '16" x 16"', category: 'XS', description: 'Great for desks or shelves', popular: false },
      { size: '24" x 24"', category: 'S', description: 'Nice fit for entryways or nooks', popular: true },
      { size: '32" x 32"', category: 'M', description: 'Perfect for bedrooms or offices', popular: false },
      { size: '36" x 36"', category: 'L', description: 'Bold accent for any room', popular: false }
    ]
  };

  const getCanvasIcon = (orientation: string) => {
    switch (orientation) {
      case 'horizontal':
        return <div className="w-8 h-5 bg-gradient-to-r from-purple-200 to-pink-200 rounded border border-purple-300 flex items-center justify-center text-xs">📷</div>;
      case 'vertical':
        return <div className="w-5 h-8 bg-gradient-to-b from-purple-200 to-pink-200 rounded border border-purple-300 flex items-center justify-center text-xs">🎨</div>;
      case 'square':
        return <div className="w-6 h-6 bg-gradient-to-br from-purple-200 to-pink-200 rounded border border-purple-300 flex items-center justify-center text-xs">⬜</div>;
      default:
        return null;
    }
  };

  const handleOrientationSelect = (orientation: string) => {
    onOrientationChange(orientation);
    // Reset size when orientation changes
    onSizeChange("");
  };

  return (
    <div className="space-y-8">
      {/* Step 2: Choose Layout */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Step 2: Choose Layout</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orientationOptions.map((orientation) => (
            <Card 
              key={orientation.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedOrientation === orientation.id 
                  ? 'ring-2 ring-teal-500 bg-teal-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleOrientationSelect(orientation.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-3">
                  {getCanvasIcon(orientation.id)}
                </div>
                <h5 className="font-semibold text-gray-900 mb-2">{orientation.name}</h5>
                <p className="text-sm text-gray-600">{orientation.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Step 3: Choose Size */}
      {selectedOrientation && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold text-gray-900">Step 3: Choose Size</h4>
            <span className="text-teal-500 text-sm">What size should I buy?</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sizeOptions[selectedOrientation]?.map((option, index) => (
              <Card 
                key={option.size}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedSize === option.size 
                    ? 'ring-2 ring-teal-500 bg-teal-50' 
                    : 'hover:shadow-md border-gray-200'
                } ${index === 0 ? 'ring-2 ring-teal-500 bg-teal-50' : ''}`}
                onClick={() => onSizeChange(option.size)}
              >
                <CardContent className="p-4 text-center">
                  <div className="bg-gray-200 rounded mb-3 h-16 flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {option.size.replace('"', '').replace('"', '')}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className={`font-bold text-lg ${
                      index === 0 ? 'text-teal-600' : 'text-gray-900'
                    }`}>
                      {option.category}
                    </span>
                    <span className="text-xs text-gray-600 text-center leading-tight">
                      {option.description}
                    </span>
                    {option.popular && (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrientationSelector;

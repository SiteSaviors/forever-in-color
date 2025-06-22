
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
  salePrice: number;
  originalPrice: number;
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
      { size: '16" x 12"', category: 'XS', description: 'Great for desks or shelves', salePrice: 99.99, originalPrice: 149.99, popular: false },
      { size: '24" x 18"', category: 'S', description: 'Nice fit for entryways or nooks', salePrice: 149.99, originalPrice: 199.99, popular: true },
      { size: '36" x 24"', category: 'M', description: 'Perfect for bedrooms or offices', salePrice: 199.99, originalPrice: 249.99, popular: false },
      { size: '40" x 30"', category: 'L', description: 'Bold accent for any room', salePrice: 269.99, originalPrice: 319.99, popular: false },
      { size: '48" x 32"', category: 'XL', description: 'Ideal for living rooms or large walls', salePrice: 349.99, originalPrice: 399.99, popular: false },
      { size: '60" x 40"', category: 'XXL', description: 'Gallery-size showstopper', salePrice: 499.99, originalPrice: 549.99, popular: false }
    ],
    vertical: [
      { size: '12" x 16"', category: 'XS', description: 'Great for desks or shelves', salePrice: 99.99, originalPrice: 149.99, popular: false },
      { size: '18" x 24"', category: 'S', description: 'Nice fit for entryways or nooks', salePrice: 149.99, originalPrice: 199.99, popular: true },
      { size: '24" x 36"', category: 'M', description: 'Perfect for bedrooms or offices', salePrice: 199.99, originalPrice: 249.99, popular: false },
      { size: '30" x 40"', category: 'L', description: 'Bold accent for any room', salePrice: 269.99, originalPrice: 319.99, popular: false },
      { size: '32" x 48"', category: 'XL', description: 'Ideal for living rooms or large walls', salePrice: 349.99, originalPrice: 399.99, popular: false },
      { size: '40" x 60"', category: 'XXL', description: 'Gallery-size showstopper', salePrice: 499.99, originalPrice: 549.99, popular: false }
    ],
    square: [
      { size: '16" x 16"', category: 'XS', description: 'Great for desks or shelves', salePrice: 99.99, originalPrice: 149.99, popular: false },
      { size: '24" x 24"', category: 'S', description: 'Nice fit for entryways or nooks', salePrice: 149.99, originalPrice: 199.99, popular: true },
      { size: '32" x 32"', category: 'M', description: 'Perfect for bedrooms or offices', salePrice: 199.99, originalPrice: 249.99, popular: false },
      { size: '36" x 36"', category: 'L', description: 'Bold accent for any room', salePrice: 269.99, originalPrice: 319.99, popular: false }
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

  const getCanvasPreview = (orientation: string, size: string) => {
    const baseClasses = "bg-gray-200 rounded flex items-center justify-center mx-auto";
    
    switch (orientation) {
      case 'horizontal':
        return (
          <div className={`${baseClasses} h-12 w-20`}>
            <span className="text-gray-600 font-medium text-xs">
              {size.replace('"', '').replace('"', '')}
            </span>
          </div>
        );
      case 'vertical':
        return (
          <div className={`${baseClasses} h-20 w-12`}>
            <span className="text-gray-600 font-medium text-xs transform -rotate-90 whitespace-nowrap">
              {size.replace('"', '').replace('"', '')}
            </span>
          </div>
        );
      case 'square':
        return (
          <div className={`${baseClasses} h-16 w-16`}>
            <span className="text-gray-600 font-medium text-xs">
              {size.replace('"', '').replace('"', '')}
            </span>
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} h-16`}>
            <span className="text-gray-600 font-medium text-sm">
              {size.replace('"', '').replace('"', '')}
            </span>
          </div>
        );
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
                  <div className="mb-4">
                    {getCanvasPreview(selectedOrientation, option.size)}
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
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-red-500 text-sm line-through">
                        ${option.originalPrice}
                      </span>
                      <span className="text-black font-bold text-lg">
                        ${option.salePrice}
                      </span>
                    </div>
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

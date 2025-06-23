import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Square, Sparkles } from "lucide-react";

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
  onContinue?: () => void;
}

const OrientationSelector = ({ 
  selectedOrientation, 
  selectedSize,
  onOrientationChange, 
  onSizeChange,
  onContinue
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

  const getOrientationIcon = (orientation: string) => {
    switch (orientation) {
      case 'horizontal':
        return <Monitor className="w-8 h-8" />;
      case 'vertical':
        return <Smartphone className="w-8 h-8" />;
      case 'square':
        return <Square className="w-8 h-8" />;
      default:
        return <Monitor className="w-8 h-8" />;
    }
  };

  const getCanvasPreview = (orientation: string, size: string) => {
    const baseClasses = "bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mx-auto border border-purple-200 shadow-sm";
    
    switch (orientation) {
      case 'horizontal':
        return (
          <div className={`${baseClasses} h-16 w-24`}>
            <span className="text-purple-700 font-medium text-xs">
              {size.replace(/"/g, '')}
            </span>
          </div>
        );
      case 'vertical':
        return (
          <div className={`${baseClasses} h-24 w-16`}>
            <span className="text-purple-700 font-medium text-xs transform -rotate-90 whitespace-nowrap">
              {size.replace(/"/g, '')}
            </span>
          </div>
        );
      case 'square':
        return (
          <div className={`${baseClasses} h-20 w-20`}>
            <span className="text-purple-700 font-medium text-xs">
              {size.replace(/"/g, '')}
            </span>
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} h-20 w-24`}>
            <span className="text-purple-700 font-medium text-sm">
              {size.replace(/"/g, '')}
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

  const handleSizeSelect = (size: string) => {
    onSizeChange(size);
  };

  const handleContinueWithSize = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSizeChange(size);
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="space-y-10">
      {/* Enhanced Step 2 Header */}
      <div className="text-center mb-8 p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-2xl border border-teal-100">
        <h4 className="text-2xl font-bold text-gray-900 mb-3 font-poppins tracking-tight">
          ✨ Step 2: Choose Layout
        </h4>
        <p className="text-gray-600 text-lg">Select the perfect orientation for your masterpiece</p>
      </div>

      {/* Premium Orientation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orientationOptions.map((orientation) => (
          <Card 
            key={orientation.id}
            className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
              selectedOrientation === orientation.id 
                ? 'ring-2 ring-teal-200 shadow-xl bg-gradient-to-r from-teal-50/50 to-cyan-50/50 border-l-4 border-l-teal-400' 
                : 'shadow-lg hover:shadow-teal-100/50'
            }`}
            onClick={() => handleOrientationSelect(orientation.id)}
          >
            <CardContent className="p-8 text-center">
              <div className={`mb-6 p-4 rounded-xl transition-all duration-300 ${
                selectedOrientation === orientation.id
                  ? 'bg-teal-100 text-teal-600 animate-slide-in'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-teal-50 group-hover:text-teal-400'
              }`}>
                {getOrientationIcon(orientation.id)}
              </div>
              <h5 className="font-bold text-xl text-gray-900 mb-3 font-poppins tracking-tight">{orientation.name}</h5>
              <p className="text-gray-600 text-base leading-relaxed">{orientation.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Step 3 Header */}
      {selectedOrientation && (
        <div className="text-center mb-8 p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-100">
          <h4 className="text-2xl font-bold text-gray-900 mb-3 font-poppins tracking-tight">
            ✨ Step 3: Choose Size
          </h4>
          <p className="text-gray-600 text-lg">Find the perfect size to showcase your art</p>
        </div>
      )}
      
      {/* Premium Size Cards with Continue Buttons */}
      {selectedOrientation && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {sizeOptions[selectedOrientation]?.map((option, index) => (
            <Card 
              key={option.size}
              className={`group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${
                selectedSize === option.size 
                  ? 'ring-2 ring-indigo-200 shadow-xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-l-4 border-l-indigo-400' 
                  : 'shadow-lg hover:shadow-indigo-100/50'
              }`}
              onClick={() => handleSizeSelect(option.size)}
            >
              <CardContent className="p-6">
                <div className="mb-6">
                  {getCanvasPreview(selectedOrientation, option.size)}
                </div>
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className={`font-bold text-xl font-poppins tracking-tight ${
                      selectedSize === option.size ? 'text-indigo-600' : 'text-gray-900'
                    }`}>
                      {option.category}
                    </span>
                    {option.popular && (
                      <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 font-semibold">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-tight">
                    {option.description}
                  </p>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500 line-through">
                      ${option.originalPrice}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 font-poppins tracking-tight">
                      ${option.salePrice}
                    </div>
                  </div>
                  
                  {/* Continue Button */}
                  <div className="pt-3">
                    <Button 
                      onClick={(e) => handleContinueWithSize(option.size, e)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm py-2 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Continue with {option.category}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrientationSelector;

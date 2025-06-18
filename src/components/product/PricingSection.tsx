
import { Check, Frame, Image, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const PricingSection = () => {
  const [selectedOrientation, setSelectedOrientation] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isFramed, setIsFramed] = useState<boolean>(true);

  const orientationOptions = [
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

  const sizeOptions = {
    horizontal: [
      { size: '16" x 12"', framedPrice: 159.99, unframedPrice: 109.99, popular: false },
      { size: '24" x 18"', framedPrice: 199.99, unframedPrice: 149.99, popular: true },
      { size: '36" x 24"', framedPrice: 249.99, unframedPrice: 199.99, popular: false },
      { size: '40" x 30"', framedPrice: 319.99, unframedPrice: 269.99, popular: false },
      { size: '48" x 32"', framedPrice: 449.99, unframedPrice: 349.00, popular: false },
      { size: '60" x 40"', framedPrice: 599.99, unframedPrice: 499.99, popular: false },
    ],
    vertical: [
      { size: '12" x 16"', framedPrice: 159.99, unframedPrice: 109.99, popular: false },
      { size: '18" x 24"', framedPrice: 199.99, unframedPrice: 149.99, popular: true },
      { size: '24" x 36"', framedPrice: 249.99, unframedPrice: 199.99, popular: false },
      { size: '30" x 40"', framedPrice: 319.99, unframedPrice: 269.99, popular: false },
      { size: '32" x 48"', framedPrice: 449.99, unframedPrice: 349.00, popular: false },
      { size: '40" x 60"', framedPrice: 599.99, unframedPrice: 499.99, popular: false },
    ],
    square: [
      { size: '16" x 16"', framedPrice: 179.99, unframedPrice: 129.99, popular: false },
      { size: '24" x 24"', framedPrice: 219.99, unframedPrice: 169.99, popular: true },
      { size: '32" x 32"', framedPrice: 349.99, unframedPrice: 269.99, popular: false },
      { size: '36" x 36"', framedPrice: 499.99, unframedPrice: 399.99, popular: false },
    ]
  };

  const getCurrentPrice = () => {
    if (!selectedOrientation || !selectedSize) return null;
    
    const orientationKey = selectedOrientation as keyof typeof sizeOptions;
    const sizeData = sizeOptions[orientationKey]?.find(item => item.size === selectedSize);
    
    if (!sizeData) return null;
    
    return isFramed ? sizeData.framedPrice : sizeData.unframedPrice;
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

  return (
    <div className="w-full space-y-8">
      {/* Frame/Unframe Toggle */}
      <Tabs defaultValue="framed" onValueChange={(value) => setIsFramed(value === "framed")} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="framed" className="flex items-center gap-2">
            <Frame className="w-4 h-4" />
            Framed
          </TabsTrigger>
          <TabsTrigger value="unframed" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Unframed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="framed">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Framed Canvas Prints</h3>
            <p className="text-gray-600">Premium canvas with professional framing</p>
          </div>
        </TabsContent>

        <TabsContent value="unframed">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unframed Canvas Prints</h3>
            <p className="text-gray-600">Ready-to-hang canvas prints without frames</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Orientation Selection */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 text-center">Choose Your Canvas Orientation</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orientationOptions.map((orientation) => (
            <Card 
              key={orientation.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedOrientation === orientation.id 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => {
                setSelectedOrientation(orientation.id);
                setSelectedSize(""); // Reset size when orientation changes
              }}
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

      {/* Size & Price Selection */}
      {selectedOrientation && (
        <div className="space-y-6">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Size & See Price
            </label>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your canvas size..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {sizeOptions[selectedOrientation as keyof typeof sizeOptions]?.map((option) => (
                  <SelectItem key={option.size} value={option.size} className="flex justify-between">
                    <div className="flex justify-between items-center w-full">
                      <span>{option.size}</span>
                      <div className="flex items-center gap-2 ml-4">
                        {option.popular && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                        <span className="font-semibold text-purple-600">
                          ${isFramed ? option.framedPrice : option.unframedPrice}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Display & Add to Cart */}
          {selectedSize && (
            <div className="max-w-md mx-auto">
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">
                      {selectedSize} • {selectedOrientation} • {isFramed ? 'Framed' : 'Unframed'}
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      ${getCurrentPrice()}
                    </p>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    size="lg"
                  >
                    Add to Cart
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Trust Elements */}
      <div className="mt-12 text-center">
        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Free shipping on all orders</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>30-day satisfaction guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Premium 1.25" depth canvas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;

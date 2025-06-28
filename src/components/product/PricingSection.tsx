
import { Frame, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import OrientationSelector from "./cropper/components/OrientationSelector";
import SizeSelector from "./SizeSelector";
import TrustElements from "./TrustElements";

const PricingSection = () => {
  const [selectedOrientation, setSelectedOrientation] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isFramed, setIsFramed] = useState<boolean>(true);

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

  const handleOrientationChange = (ratio: number, orientationId: string) => {
    setSelectedOrientation(orientationId);
    setSelectedSize(""); // Reset size when orientation changes
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
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
      <OrientationSelector 
        cropAspect={1.0}
        recommendedOrientation={selectedOrientation || "square"}
        onOrientationChange={handleOrientationChange}
      />

      {/* Size & Price Selection */}
      <SizeSelector
        selectedOrientation={selectedOrientation}
        selectedSize={selectedSize}
        isFramed={isFramed}
        onSizeChange={setSelectedSize}
        sizeOptions={sizeOptions}
      />

      {/* Trust Elements */}
      <TrustElements />
    </div>
  );
};

export default PricingSection;

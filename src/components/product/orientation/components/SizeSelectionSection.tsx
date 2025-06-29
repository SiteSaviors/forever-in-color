
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SizeSelectionSectionProps {
  selectedSize: string | null;
  selectedOrientation: string;
  onSizeSelect: (size: string) => void;
  onOrientationSelect: (orientation: string) => void;
}

const SizeSelectionSection = ({
  selectedSize,
  selectedOrientation,
  onSizeSelect,
  onOrientationSelect
}: SizeSelectionSectionProps) => {
  const sizes = [
    { size: "8x10", price: 49, popular: false },
    { size: "12x16", price: 89, popular: true },
    { size: "16x20", price: 129, popular: false },
    { size: "20x24", price: 169, popular: false }
  ];

  const orientations = [
    { id: "square", name: "Square", description: "Perfect for Instagram-style photos" },
    { id: "horizontal", name: "Horizontal", description: "Great for landscapes" },
    { id: "vertical", name: "Vertical", description: "Ideal for portraits" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Orientation</h3>
        <div className="grid grid-cols-3 gap-3">
          {orientations.map((orientation) => (
            <Button
              key={orientation.id}
              variant={selectedOrientation === orientation.id ? "default" : "outline"}
              onClick={() => onOrientationSelect(orientation.id)}
              className="h-auto p-4 flex flex-col items-center"
            >
              <span className="font-medium">{orientation.name}</span>
              <span className="text-xs text-gray-500">{orientation.description}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Select Size</h3>
        <div className="grid grid-cols-2 gap-4">
          {sizes.map((size) => (
            <Card 
              key={size.size}
              className={`cursor-pointer border-2 transition-colors ${
                selectedSize === size.size 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onSizeSelect(size.size)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{size.size}"</h4>
                    {size.popular && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${size.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SizeSelectionSection;

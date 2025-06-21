
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrientationOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface SizeOption {
  size: string;
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
      { size: '16" x 12"' },
      { size: '24" x 18"', popular: true },
      { size: '36" x 24"' },
      { size: '40" x 30"' },
      { size: '48" x 32"' },
      { size: '60" x 40"' }
    ],
    vertical: [
      { size: '12" x 16"' },
      { size: '18" x 24"', popular: true },
      { size: '24" x 36"' },
      { size: '30" x 40"' },
      { size: '32" x 48"' },
      { size: '40" x 60"' }
    ],
    square: [
      { size: '16" x 16"' },
      { size: '24" x 24"', popular: true },
      { size: '32" x 32"' },
      { size: '36" x 36"' }
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

      {selectedOrientation && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 text-center">Select Canvas Size</h4>
          <div className="max-w-md mx-auto">
            <Select value={selectedSize} onValueChange={onSizeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your canvas size..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {sizeOptions[selectedOrientation]?.map((option) => (
                  <SelectItem key={option.size} value={option.size}>
                    <div className="flex justify-between items-center w-full">
                      <span>{option.size}</span>
                      {option.popular && (
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full ml-2">
                          Popular
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrientationSelector;


import { Card, CardContent } from "@/components/ui/card";

interface OrientationOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface OrientationSelectorProps {
  selectedOrientation: string;
  onOrientationChange: (orientation: string) => void;
}

const OrientationSelector = ({ selectedOrientation, onOrientationChange }: OrientationSelectorProps) => {
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
            onClick={() => onOrientationChange(orientation.id)}
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
  );
};

export default OrientationSelector;

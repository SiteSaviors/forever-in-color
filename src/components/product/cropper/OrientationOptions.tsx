
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Square } from "lucide-react";

interface OrientationOptionsProps {
  cropAspect: number;
  onOrientationChange: (newAspect: number, orientationId: string) => void;
}

const OrientationOptions = ({ cropAspect, onOrientationChange }: OrientationOptionsProps) => {
  const orientationOptions = [
    { 
      id: 'square', 
      name: 'Square', 
      ratio: 1, 
      icon: Square,
      description: 'Perfect for social media'
    },
    { 
      id: 'horizontal', 
      name: 'Horizontal', 
      ratio: 4/3, 
      icon: Monitor,
      description: 'Great for landscapes'
    },
    { 
      id: 'vertical', 
      name: 'Vertical', 
      ratio: 3/4, 
      icon: Smartphone,
      description: 'Ideal for portraits'
    }
  ];

  const getCurrentOrientation = () => {
    return orientationOptions.find(opt => opt.ratio === cropAspect) || orientationOptions[0];
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <Badge variant="outline" className="bg-white border-purple-200 text-purple-700 font-medium">
          Current: {getCurrentOrientation().name}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-md mx-auto">
        {orientationOptions.map((option) => {
          const IconComponent = option.icon;
          const isActive = cropAspect === option.ratio;
          
          return (
            <Button
              key={option.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onOrientationChange(option.ratio, option.id)}
              className={`flex flex-col items-center gap-1 h-auto py-3 px-2 md:px-3 text-xs ${
                isActive 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg' 
                  : 'hover:bg-purple-50 hover:border-purple-300 text-gray-700'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{option.name}</span>
              <span className="text-[10px] opacity-75 hidden md:block">
                {option.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default OrientationOptions;

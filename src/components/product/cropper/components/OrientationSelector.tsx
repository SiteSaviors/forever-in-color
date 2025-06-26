
import React from "react";
import { Badge } from "@/components/ui/badge";
import { orientationOptions } from "../data/orientationOptions";

interface OrientationSelectorProps {
  cropAspect: number;
  recommendedOrientation: string;
  onOrientationChange: (ratio: number, orientationId: string) => void;
}

const OrientationSelector = ({ 
  cropAspect, 
  recommendedOrientation, 
  onOrientationChange 
}: OrientationSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        {recommendedOrientation && (
          <p className="text-sm text-purple-600 font-medium">
            💡 Recommended: {orientationOptions.find(opt => opt.id === recommendedOrientation)?.name}
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {orientationOptions.map(option => {
          const IconComponent = option.icon;
          const isActive = cropAspect === option.ratio;
          const isRecommended = option.id === recommendedOrientation;
          
          return (
            <div 
              key={option.id} 
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                isActive 
                  ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105' 
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'
              }`}
              onClick={() => onOrientationChange(option.ratio, option.id)}
            >
              {isRecommended && (
                <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs">
                  Recommended
                </Badge>
              )}
              
              <div className="text-center space-y-3">
                <div className={`flex justify-center p-3 rounded-lg ${
                  isActive ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                
                <div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h5 className="font-bold text-lg text-gray-900">{option.name}</h5>
                    <Badge variant="outline" className="text-xs">{option.dimensions}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {option.description}
                  </p>
                </div>
                
                {isActive && (
                  <Badge className="bg-purple-500 text-white">
                    ✓ Selected
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrientationSelector;

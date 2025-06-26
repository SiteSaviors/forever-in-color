
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap } from "lucide-react";
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
  const getRecommendationReason = (orientationId: string) => {
    switch (orientationId) {
      case 'horizontal':
        return 'Perfect for landscapes, wide shots, and panoramic views';
      case 'vertical':
        return 'Ideal for portraits, people, and tall architectural subjects';
      case 'square':
      default:
        return 'Great for social media, symmetric compositions, and balanced art';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Recommendation Header */}
      {recommendedOrientation && (
        <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-1 bg-purple-100 rounded-full">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="font-semibold text-purple-900">AI Recommendation</h4>
            <Badge className="bg-purple-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart Choice
            </Badge>
          </div>
          <p className="text-sm text-purple-700">
            Based on your photo's composition, we recommend the <strong>{recommendedOrientation}</strong> canvas format
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {orientationOptions.map(option => {
          const IconComponent = option.icon;
          const isActive = cropAspect === option.ratio;
          const isRecommended = option.id === recommendedOrientation;
          
          return (
            <div 
              key={option.id} 
              className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105
                ${isActive 
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl scale-105' 
                  : isRecommended
                    ? 'border-purple-300 bg-gradient-to-br from-purple-25 to-pink-25 shadow-lg hover:border-purple-400'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25 shadow-md'
                }
              `} 
              onClick={() => onOrientationChange(option.ratio, option.id)}
            >
              {/* Recommendation Badge */}
              {isRecommended && !isActive && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg animate-pulse">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Pick
                  </Badge>
                </div>
              )}
              
              <div className="text-center space-y-4">
                {/* Icon */}
                <div className={`
                  flex justify-center p-4 rounded-xl transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg' 
                    : isRecommended
                      ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600'
                      : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  <IconComponent className="w-8 h-8" />
                </div>
                
                {/* Content */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <h5 className="font-bold text-lg text-gray-900">{option.name}</h5>
                      <Badge variant="outline" className="text-xs border-gray-300">
                        {option.dimensions}
                      </Badge>
                    </div>
                    
                    {/* Enhanced description for recommended option */}
                    <p className={`text-sm leading-relaxed ${
                      isRecommended ? 'text-purple-700 font-medium' : 'text-gray-600'
                    }`}>
                      {isRecommended 
                        ? getRecommendationReason(option.id)
                        : option.description
                      }
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  {isActive && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                      ✓ Selected
                    </Badge>
                  )}
                  
                  {isRecommended && !isActive && (
                    <Badge variant="outline" className="border-purple-300 text-purple-600 bg-purple-50">
                      🎯 Recommended for your photo
                    </Badge>
                  )}
                </div>
              </div>

              {/* Glow effect for recommended option */}
              {isRecommended && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-sm -z-10" />
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Context */}
      <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
        <p>
          Our AI analyzed your photo's composition, subject matter, and aspect ratio to suggest the best canvas format. 
          You can always choose a different orientation if you prefer.
        </p>
      </div>
    </div>
  );
};

export default OrientationSelector;

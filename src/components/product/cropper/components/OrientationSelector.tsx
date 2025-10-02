
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap } from "@/components/ui/icons";
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
      {/* Hero-Level AI Recommendation Header */}
      {recommendedOrientation && (
        <div className="text-center bg-gradient-to-r from-cyan-50/80 to-fuchsia-50/80 rounded-xl p-4 border-2 border-cyan-200/60 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-1 bg-gradient-to-br from-cyan-100/80 to-fuchsia-100/80 rounded-full shadow-lg">
              <Zap className="w-4 h-4 text-cyan-600" />
            </div>
            <h4 className="font-semibold text-gray-900 font-montserrat">AI Recommendation</h4>
            <Badge className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart Choice
            </Badge>
          </div>
          <p className="text-sm text-gray-700 font-poppins">
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
                  ? 'border-cyan-500 bg-gradient-to-br from-cyan-50/80 via-violet-50/60 to-fuchsia-100/40 shadow-2xl scale-105 backdrop-blur-sm' 
                  : isRecommended
                    ? 'border-cyan-300/60 bg-gradient-to-br from-cyan-25/60 to-fuchsia-25/40 shadow-xl hover:border-cyan-400 backdrop-blur-sm'
                    : 'border-gray-200/60 bg-white/80 hover:border-cyan-300 hover:bg-cyan-25/40 shadow-lg backdrop-blur-sm'
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
                    ? 'bg-gradient-to-br from-cyan-500 via-violet-500 to-fuchsia-500 text-white shadow-2xl shadow-cyan-500/30' 
                    : isRecommended
                      ? 'bg-gradient-to-br from-cyan-100/80 to-fuchsia-100/80 text-cyan-600'
                      : 'bg-gray-100/80 text-gray-500'
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
                    <Badge className="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 text-white shadow-2xl shadow-cyan-500/30">
                      ✓ Selected
                    </Badge>
                  )}
                  
                  {isRecommended && !isActive && (
                    <Badge variant="outline" className="border-cyan-300/60 text-cyan-600 bg-cyan-50/80 backdrop-blur-sm">
                      🎯 Recommended for your photo
                    </Badge>
                  )}
                </div>
              </div>

              {/* Hero-Level Glow effect for recommended option */}
              {isRecommended && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/20 via-violet-400/15 to-fuchsia-400/20 blur-lg -z-10" />
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

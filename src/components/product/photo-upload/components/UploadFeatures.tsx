
import { Badge } from "@/components/ui/badge";
import { Camera, Sparkles, Shield, CheckCircle } from "lucide-react";

const UploadFeatures = () => {
  const features = [
    {
      icon: Camera,
      title: "Smart Crop",
      subtitle: "AI-powered framing",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: CheckCircle,
      title: "Any Format", 
      subtitle: "JPG, PNG, HEIC",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Sparkles,
      title: "AI Enhanced",
      subtitle: "Professional quality",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Shield,
      title: "Secure",
      subtitle: "Private & safe",
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <div key={index} className="text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className={`p-2 sm:p-3 rounded-full bg-gradient-to-br ${feature.color} shadow-lg`}>
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-800 text-xs sm:text-sm">{feature.title}</div>
                <div className="text-gray-500 text-xs">{feature.subtitle}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UploadFeatures;


import { Badge } from "@/components/ui/badge";
import { Camera, Sparkles, Shield, CheckCircle } from "lucide-react";

const UploadFeatures = () => {
  const features = [
    {
      icon: Camera,
      title: "Smart Crop",
      subtitle: "AI-powered framing",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: CheckCircle,
      title: "Any Format", 
      subtitle: "JPG, PNG, HEIC",
      color: "from-violet-500 to-violet-600"
    },
    {
      icon: Sparkles,
      title: "AI Enhanced",
      subtitle: "Professional quality",
      color: "from-fuchsia-500 to-fuchsia-600"
    },
    {
      icon: Shield,
      title: "Secure",
      subtitle: "Private & safe",
      color: "from-rose-500 to-rose-600"
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
                <div className="font-montserrat font-black text-white text-sm sm:text-base drop-shadow-lg">{feature.title}</div>
                <div className="font-poppins text-white/80 text-xs sm:text-sm drop-shadow-sm">{feature.subtitle}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UploadFeatures;

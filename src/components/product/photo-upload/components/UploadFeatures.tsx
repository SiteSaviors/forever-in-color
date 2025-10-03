
import { Camera, Sparkles, Shield, CheckCircle } from "@/components/ui/icons";

const UploadFeatures = () => {
  const features = [
    {
      icon: Camera,
      title: "Smart Crop",
      subtitle: "AI-powered framing",
      color: "from-cyan-500 to-cyan-600",
      shadowColor: "shadow-cyan-500/30"
    },
    {
      icon: CheckCircle,
      title: "Any Format", 
      subtitle: "JPG, PNG, HEIC",
      color: "from-violet-500 to-violet-600",
      shadowColor: "shadow-violet-500/30"
    },
    {
      icon: Sparkles,
      title: "AI Enhanced",
      subtitle: "Professional quality",
      color: "from-fuchsia-500 to-fuchsia-600",
      shadowColor: "shadow-fuchsia-500/30"
    },
    {
      icon: Shield,
      title: "Secure",
      subtitle: "Private & safe",
      color: "from-rose-500 to-rose-600",
      shadowColor: "shadow-rose-500/30"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <div key={index} className="text-center group">
            <div className="flex flex-col items-center space-y-2">
              <div className={`p-2 sm:p-3 rounded-full bg-gradient-to-br ${feature.color} shadow-2xl ${feature.shadowColor} backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-3xl`}>
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="font-montserrat font-black text-white text-sm sm:text-base drop-shadow-2xl">{feature.title}</div>
                <div className="font-poppins text-white/90 text-xs sm:text-sm drop-shadow-lg">{feature.subtitle}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UploadFeatures;

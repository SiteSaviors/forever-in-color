
import { Palette, Zap, Star, Target } from "lucide-react";

const PopArtBurstFeatures = () => {
  const features = [
    {
      icon: Target,
      title: "Bold Outlines",
      description: "Thick black comic book lines that make your subject pop off the canvas",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Palette,
      title: "Vibrant Color Blocks",
      description: "Flat, saturated colors that capture the essence of classic pop art",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Zap,
      title: "Halftone Textures",
      description: "Authentic comic book dot patterns for that vintage print look",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Star,
      title: "Warhol Inspired",
      description: "Channel the masters with Roy Lichtenstein and Andy Warhol aesthetics",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-gray-900" 
              style={{ textShadow: '2px 2px 0px #fbbf24' }}>
            Pop Art Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every element designed to bring that authentic comic book and pop art gallery feel
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              <div className="bg-white border-4 border-black p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center border-4 border-black`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{feature.description}</p>
              </div>
              
              {/* Comic book style speech bubble tail */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l-4 border-b-4 border-black transform rotate-45"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopArtBurstFeatures;


import { Upload, Palette, Download, Zap } from "lucide-react";

const PopArtBurstHowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      step: "1",
      title: "Upload Your Photo",
      description: "Share any photo - portrait, pet, or scene you want to transform",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Palette,
      step: "2", 
      title: "AI Creates Magic",
      description: "Our AI adds bold outlines, vibrant colors, and halftone textures",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: Zap,
      step: "3",
      title: "Customize Style",
      description: "Adjust colors, intensity, and comic book effects to your taste",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Download,
      step: "4",
      title: "Get Your Artwork",
      description: "Download high-res files or order premium canvas prints",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 text-gray-900"
              style={{ textShadow: '2px 2px 0px #3b82f6' }}>
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From ordinary photo to extraordinary pop art in just 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group relative">
              <div className="relative mb-8">
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center border-4 border-black shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center font-black text-black">
                  {step.step}
                </div>
              </div>
              
              <h3 className="text-xl font-black mb-4 text-gray-900">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed font-medium">{step.description}</p>
              
              {/* Connection arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-4 text-3xl text-gray-300 font-black">
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white px-8 py-4 rounded-full border-4 border-black font-black text-lg">
            Total time: Under 5 minutes! ⚡
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopArtBurstHowItWorks;

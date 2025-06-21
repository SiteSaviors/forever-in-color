
import { Sparkles, Camera } from "lucide-react";
import HeroContent from "./HeroContent";
import PhotoFrames from "./PhotoFrames";
import PhoneMockup from "./PhoneMockup";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{
      backgroundImage: `url('/lovable-uploads/3e752087-b61d-463b-87ca-313d878c43c1.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-12">
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Content */}
          <div className="text-center mb-12">
            <HeroContent />
          </div>

          {/* Mobile Visual Showcase */}
          <div className="relative h-96 mb-8">
            <PhotoFrames />
            <PhoneMockup />
            
            {/* Floating Elements */}
            <div className="absolute top-4 right-4 bg-white/95 shadow-lg rounded-full p-2 z-40 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-purple-500" />
            </div>
            <div className="absolute bottom-4 left-4 bg-white/95 shadow-lg rounded-full p-2 z-40 backdrop-blur-sm">
              <Camera className="w-3 h-3 text-pink-500" />
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center min-h-[75vh]">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <HeroContent />
          </div>

          {/* Right Column - Visual Showcase */}
          <div className="relative h-[500px]">
            <PhotoFrames />
            <PhoneMockup />

            {/* Floating Elements */}
            <div className="absolute top-6 right-6 bg-white shadow-lg rounded-full p-2.5 z-40">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="absolute bottom-6 left-6 bg-white shadow-lg rounded-full p-2.5 z-40">
              <Camera className="w-4 h-4 text-pink-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

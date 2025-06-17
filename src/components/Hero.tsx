
import { Sparkles, Camera } from "lucide-react";
import HeroContent from "./HeroContent";
import PhotoFrames from "./PhotoFrames";
import PhoneMockup from "./PhoneMockup";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <HeroContent />

          {/* Right Column - Visual Showcase */}
          <div className="relative h-[400px] sm:h-[600px] lg:h-[700px] px-4 sm:px-0">
            {/* Rainbow Photo Frames Container */}
            <PhotoFrames />

            {/* Phone Mockup with AR Video */}
            <PhoneMockup />

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 bg-white shadow-lg rounded-full p-2 sm:p-3 z-40">
              <Sparkles className="w-3 h-3 sm:w-6 sm:h-6 text-purple-500" />
            </div>
            <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-full p-2 sm:p-3 z-40">
              <Camera className="w-3 h-3 sm:w-6 sm:h-6 text-pink-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

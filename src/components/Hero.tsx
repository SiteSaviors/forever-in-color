

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Mobile Layout - Badge/Headline First, Then Visual, Then Content */}
        <div className="lg:hidden">
          {/* Mobile Badge and Headline - Clean spacing below header */}
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-5 py-2.5 border border-purple-100/60 shadow-sm mb-8">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">Modern Heirlooms, Made Just for You</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl font-bold leading-[0.9] px-2">
              <div className="text-gray-900">Your Memories</div>
              <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                REIMAGINED
              </div>
            </h1>
          </div>

          {/* Mobile Visual Showcase - Optimized spacing */}
          <div className="relative h-[380px] mb-12 mx-2">
            <PhotoFrames />
            <PhoneMockup />
            
            {/* Floating Elements */}
            <div className="absolute top-3 right-3 bg-white/95 shadow-md rounded-full p-2 z-40 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-purple-500" />
            </div>
            <div className="absolute bottom-3 left-3 bg-white/95 shadow-md rounded-full p-2 z-40 backdrop-blur-sm">
              <Camera className="w-3 h-3 text-pink-500" />
            </div>
          </div>

          {/* Mobile Content - Clean spacing below visual */}
          <div className="px-2">
            <HeroContent hideBadgeAndHeadline={true} />
          </div>
        </div>

        {/* Desktop Layout - Side by Side */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <HeroContent />

          {/* Right Column - Visual Showcase - Reduced height for smaller elements */}
          <div className="relative h-[580px] px-0">
            <PhotoFrames />
            <PhoneMockup />

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 bg-white shadow-lg rounded-full p-3 z-40">
              <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div className="absolute bottom-4 left-4 bg-white shadow-lg rounded-full p-3 z-40">
              <Camera className="w-6 h-6 text-pink-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


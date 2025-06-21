
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
      {/* Background Elements - Standardized positioning */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-300/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-16">
        {/* Mobile Layout - Updated to match desktop colors */}
        <div className="lg:hidden">
          {/* Mobile Badge and Headline - Updated colors */}
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-200 shadow-sm mb-8">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Modern Heirlooms, Made Just for You</span>
            </div>

            {/* Main Headline - Updated colors to match desktop */}
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 font-montserrat">
              <div className="text-white mb-2">Your Memories</div>
              <div className="text-5xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent font-oswald">
                REIMAGINED
              </div>
            </h1>
          </div>

          {/* Mobile Visual Showcase - Grid-aligned positioning */}
          <div className="relative h-96 mb-16">
            <PhotoFrames />
            <PhoneMockup />
            
            {/* Floating Elements - Consistent sizing and positioning */}
            <div className="absolute top-4 right-4 bg-white/95 shadow-lg rounded-full p-3 z-40 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="absolute bottom-4 left-4 bg-white/95 shadow-lg rounded-full p-3 z-40 backdrop-blur-sm">
              <Camera className="w-4 h-4 text-pink-500" />
            </div>
          </div>

          {/* Mobile Content */}
          <div>
            <HeroContent hideBadgeAndHeadline={true} />
          </div>
        </div>

        {/* Desktop Layout - Grid-based alignment */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <HeroContent />

          {/* Right Column - Visual Showcase - Consistent dimensions */}
          <div className="relative h-[600px]">
            <PhotoFrames />
            <PhoneMockup />

            {/* Floating Elements - Standardized sizing */}
            <div className="absolute top-6 right-6 bg-white shadow-lg rounded-full p-4 z-40">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <div className="absolute bottom-6 left-6 bg-white shadow-lg rounded-full p-4 z-40">
              <Camera className="w-5 h-5 text-pink-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

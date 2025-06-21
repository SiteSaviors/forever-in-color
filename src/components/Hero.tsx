
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

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        {/* Mobile Layout - Refined visual hierarchy */}
        <div className="lg:hidden">
          {/* Mobile Badge and Headline - More breathing room */}
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-200 shadow-sm mb-12">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Modern Heirlooms, Made Just for You</span>
            </div>

            {/* Main Headline - Increased prominence and spacing */}
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6 font-montserrat">
              <div className="text-white mb-3">Your Memories</div>
              <div className="text-6xl sm:text-7xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent font-oswald">
                REIMAGINED
              </div>
            </h1>
          </div>

          {/* Mobile Visual Showcase - Scaled down and positioned lower */}
          <div className="relative h-80 mb-16">
            <PhotoFrames />
            <PhoneMockup />
            
            {/* Floating Elements - Smaller and more subtle */}
            <div className="absolute top-6 right-6 bg-white/95 shadow-lg rounded-full p-2.5 z-40 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="absolute bottom-6 left-6 bg-white/95 shadow-lg rounded-full p-2.5 z-40 backdrop-blur-sm">
              <Camera className="w-3.5 h-3.5 text-pink-500" />
            </div>
          </div>

          {/* Mobile Content */}
          <div>
            <HeroContent hideBadgeAndHeadline={true} />
          </div>
        </div>

        {/* Desktop Layout - Rebalanced with better visual hierarchy */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-16 items-start min-h-[80vh]">
          {/* Left Column - Content (3/5 width for more prominence) */}
          <div className="col-span-3 pt-8">
            <HeroContent />
          </div>

          {/* Right Column - Visual Showcase (2/5 width, positioned lower) */}
          <div className="col-span-2 relative h-[480px] mt-24">
            <PhotoFrames />
            <PhoneMockup />

            {/* Floating Elements - Smaller and more subtle */}
            <div className="absolute top-8 right-8 bg-white shadow-lg rounded-full p-3 z-40">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="absolute bottom-8 left-8 bg-white shadow-lg rounded-full p-3 z-40">
              <Camera className="w-4 h-4 text-pink-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

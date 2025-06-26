
import { Sparkles, Camera } from "lucide-react";
import HeroContent from "./HeroContent";
import PhotoFrames from "./PhotoFrames";
import PhoneMockup from "./PhoneMockup";
import { useState, useEffect } from "react";

const Hero = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Preload critical hero image
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      // Delay showing content slightly for smoother transition
      setTimeout(() => setShowContent(true), 100);
    };
    img.src = '/lovable-uploads/3e752087-b61d-463b-87ca-313d878c43c1.png';
  }, []);

  return (
    <section 
      className={`relative min-h-screen overflow-hidden transition-opacity duration-500 ${
        imageLoaded ? 'opacity-100' : 'opacity-90'
      }`} 
      style={{
        backgroundImage: imageLoaded 
          ? `url('/lovable-uploads/3e752087-b61d-463b-87ca-313d878c43c1.png')`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Simplified Background Elements - Reduce complexity */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-pink-300/15 to-purple-400/15 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-300/15 to-purple-400/15 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-purple-300/15 to-pink-400/15 rounded-full blur-xl"></div>
      </div>

      <div className={`relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16 transition-opacity duration-300 ${
        showContent ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Badge and Headline */}
          <div className="text-center mb-16">
            {/* Optimized Badge - Reduce backdrop-blur */}
            <div className="inline-flex items-center space-x-2 bg-white/85 rounded-full px-6 py-3 border border-purple-200 shadow-sm mb-8">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Modern Heirlooms, Made Just for You</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 font-montserrat">
              <div className="text-white mb-2">Your Memories</div>
              <div className="text-5xl bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent font-oswald">
                REIMAGINED
              </div>
            </h1>
          </div>

          {/* Mobile Visual Showcase - Lazy load components */}
          <div className="relative h-96 mb-16">
            {showContent && (
              <>
                <PhotoFrames />
                <PhoneMockup />
              </>
            )}
            
            {/* Simplified Floating Elements */}
            <div className="absolute top-4 right-4 bg-white/90 shadow-lg rounded-full p-3 z-40">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div className="absolute bottom-4 left-4 bg-white/90 shadow-lg rounded-full p-3 z-40">
              <Camera className="w-4 h-4 text-pink-500" />
            </div>
          </div>

          {/* Mobile Content */}
          <div>
            <HeroContent hideBadgeAndHeadline={true} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Column - Content */}
          <HeroContent />

          {/* Right Column - Visual Showcase */}
          <div className="relative h-[600px]">
            {showContent && (
              <>
                <PhotoFrames />
                <PhoneMockup />
              </>
            )}

            {/* Optimized Floating Elements */}
            <div className="absolute top-6 right-6 bg-white/90 shadow-lg rounded-full p-4 z-40">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <div className="absolute bottom-6 left-6 bg-white/90 shadow-lg rounded-full p-4 z-40">
              <Camera className="w-5 h-5 text-pink-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

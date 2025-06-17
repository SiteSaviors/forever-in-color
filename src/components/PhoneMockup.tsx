
import { Play } from "lucide-react";

const PhoneMockup = () => {
  return (
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-30">
      <div className="relative">
        {/* Phone Frame - Larger */}
        <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          <div className="bg-black rounded-[2.5rem] w-56 h-[450px] sm:w-64 sm:h-[520px] relative overflow-hidden">
            {/* Screen Content */}
            <div className="absolute inset-3 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 rounded-[2rem] flex items-center justify-center">
              {/* Video Container */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-[2rem]"></div>
                
                {/* Video Element */}
                <video
                  className="w-full h-full object-cover rounded-[2rem]"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/your-video.mp4" type="video/mp4" />
                  {/* Fallback content if video doesn't load */}
                  <div className="relative text-center space-y-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-sm sm:text-base font-semibold">AR Experience</p>
                      <p className="text-xs sm:text-sm opacity-75">Video not available</p>
                    </div>
                  </div>
                </video>

                {/* AR Elements Overlay */}
                <div className="absolute -top-6 -right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-semibold pointer-events-none">
                  LIVE AR
                </div>
              </div>
            </div>
            
            {/* Phone Details */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 h-1.5 bg-gray-600 rounded-full"></div>
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 w-32 sm:w-40 h-1.5 bg-gray-600 rounded-full"></div>
          </div>
        </div>
        
        {/* Floating AR Badge */}
        <div className="absolute -top-6 sm:-top-8 -right-4 sm:-right-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-semibold shadow-lg animate-pulse">
          Live AR Demo
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;


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
                
                {/* Vimeo Video Embed */}
                <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                  <div style={{ padding: '177.78% 0 0 0', position: 'relative', width: '100%', height: '100%' }}>
                    <iframe 
                      src="https://player.vimeo.com/video/1093921547?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=1&background=1"
                      frameBorder="0" 
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      title="Forever In Color Hero Video"
                      className="rounded-[2rem]"
                    />
                  </div>
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

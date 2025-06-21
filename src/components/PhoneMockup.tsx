
import { Play } from "lucide-react";

const PhoneMockup = () => {
  return (
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-30">
      <div className="relative">
        {/* Phone Frame - Smaller proportions */}
        <div className="bg-gray-900 rounded-2xl sm:rounded-[3rem] p-1.5 sm:p-3 lg:p-2 shadow-2xl">
          <div className="bg-black rounded-xl sm:rounded-[2.5rem] w-28 h-52 sm:w-52 sm:h-[420px] lg:w-44 lg:h-[360px] relative overflow-hidden">
            {/* Screen Content */}
            <div className="absolute inset-1 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 rounded-lg sm:rounded-[2rem] flex items-center justify-center">
              {/* Video Container */}
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Vimeo Video Embed */}
                <div className="w-full h-full rounded-lg sm:rounded-[2rem] overflow-hidden relative">
                  <div style={{ padding: '177.78% 0 0 0', position: 'relative', width: '100%', height: '100%' }}>
                    <iframe 
                      src="https://player.vimeo.com/video/1093921547?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=1&background=1"
                      frameBorder="0" 
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      title="Forever In Color Hero Video"
                      className="rounded-lg sm:rounded-[2rem]"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Phone Details */}
            <div className="absolute top-2 sm:top-6 lg:top-5 left-1/2 transform -translate-x-1/2 w-6 sm:w-16 lg:w-14 h-1 sm:h-1.5 lg:h-1 bg-gray-600 rounded-full"></div>
            <div className="absolute bottom-1 sm:bottom-5 lg:bottom-3 left-1/2 transform -translate-x-1/2 w-14 sm:w-32 lg:w-28 h-1 sm:h-1.5 lg:h-1 bg-gray-600 rounded-full"></div>
          </div>
        </div>
        
        {/* Floating AR Badge */}
        <div className="absolute -top-2 sm:-top-6 lg:-top-5 -right-1 sm:-right-5 lg:-right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 lg:px-2.5 lg:py-1 rounded-full text-[10px] sm:text-sm lg:text-xs font-semibold shadow-lg animate-pulse">
          Live AR Demo
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;

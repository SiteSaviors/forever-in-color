
import { Play } from "lucide-react";

const PhoneMockup = () => {
  return (
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-30 scale-90">
      <div className="relative">
        {/* Phone Frame */}
        <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-xl">
          <div className="bg-black rounded-lg sm:rounded-xl w-28 h-48 sm:w-48 sm:h-96 relative overflow-hidden">
            {/* Screen Content */}
            <div className="absolute inset-1 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 rounded-md sm:rounded-lg flex items-center justify-center">
              {/* Video Container */}
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Vimeo Video Embed */}
                <div className="w-full h-full rounded-md sm:rounded-lg overflow-hidden relative">
                  <div style={{ padding: '177.78% 0 0 0', position: 'relative', width: '100%', height: '100%' }}>
                    <iframe 
                      src="https://player.vimeo.com/video/1093921547?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&loop=1&muted=1&background=1"
                      frameBorder="0" 
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                      title="Forever In Color Hero Video"
                      className="rounded-md sm:rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Phone Details */}
            <div className="absolute top-1.5 sm:top-4 left-1/2 transform -translate-x-1/2 w-4 sm:w-12 h-0.5 sm:h-1 bg-gray-600 rounded-full"></div>
            <div className="absolute bottom-1 sm:bottom-3 left-1/2 transform -translate-x-1/2 w-8 sm:w-24 h-0.5 sm:h-1 bg-gray-600 rounded-full"></div>
          </div>
        </div>
        
        {/* Floating AR Badge */}
        <div className="absolute -top-1.5 sm:-top-4 -right-1 sm:-right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-xs font-semibold shadow-lg animate-pulse">
          Live AR Demo
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;

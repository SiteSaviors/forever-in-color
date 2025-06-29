


const PhoneMockup = () => {
  return (
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-30">
      <div className="relative">
        {/* Phone Frame - Better proportions on mobile and smaller on desktop */}
        <div className="bg-gray-900 rounded-2xl sm:rounded-[3rem] p-1.5 sm:p-3 lg:p-2 shadow-2xl">
          <div className="bg-black rounded-xl sm:rounded-[2.5rem] w-32 h-60 sm:w-64 sm:h-[520px] lg:w-52 lg:h-[420px] relative overflow-hidden">
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
            <div className="absolute top-2 sm:top-8 lg:top-6 left-1/2 transform -translate-x-1/2 w-8 sm:w-20 lg:w-16 h-1 sm:h-1.5 lg:h-1 bg-gray-600 rounded-full"></div>
            <div className="absolute bottom-1 sm:bottom-6 lg:bottom-4 left-1/2 transform -translate-x-1/2 w-16 sm:w-40 lg:w-32 h-1 sm:h-1.5 lg:h-1 bg-gray-600 rounded-full"></div>
          </div>
        </div>
        
        {/* Floating AR Badge */}
        <div className="absolute -top-2 sm:-top-8 lg:-top-6 -right-1 sm:-right-6 lg:-right-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 sm:px-4 sm:py-2 lg:px-3 lg:py-1.5 rounded-full text-[10px] sm:text-base lg:text-sm font-semibold shadow-lg animate-pulse">
          Live AR Demo
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;



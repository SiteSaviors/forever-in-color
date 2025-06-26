
import { Sparkles, Expand } from "lucide-react";
import { useState } from "react";
import Lightbox from "@/components/ui/lightbox";

interface CanvasPreviewSectionProps {
  userArtworkUrl?: string | null;
  selectedOrientation: string;
  canvasFrame: string;
  artworkPosition: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
  isLoading?: boolean;
  error?: string | null;
}

const CanvasPreviewSection = ({
  userArtworkUrl,
  selectedOrientation,
  canvasFrame,
  artworkPosition,
  isLoading = false,
  error = null
}: CanvasPreviewSectionProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleExpandClick = () => {
    if (userArtworkUrl && !isLoading && !error) {
      setIsLightboxOpen(true);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center px-4 sm:px-0">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Your Canvas Preview</h3>
        <p className="text-sm sm:text-base text-gray-600">Premium gallery-quality canvas with your AI-generated artwork</p>
      </div>
      
      {/* Canvas Preview with AI-Generated Artwork */}
      <div className="relative group mx-auto max-w-lg sm:max-w-none">
        {/* Canvas Frame */}
        <img 
          src={canvasFrame}
          alt="Canvas Mockup" 
          className="w-full h-auto rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02]" 
        />
        
        {/* Enhanced Expand Button - Always visible on mobile with 44px minimum touch target */}
        {userArtworkUrl && !isLoading && !error && (
          <button
            onClick={handleExpandClick}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/70 hover:bg-black/90 active:bg-black text-white rounded-full p-3 sm:p-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 z-20 touch-manipulation shadow-lg"
            title="Expand to full size"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <Expand className="w-4 h-4 sm:w-4 sm:h-4" />
          </button>
        )}
        
        {/* AI-Generated Artwork Overlay - Enhanced for touch */}
        {userArtworkUrl && !isLoading && (
          <div 
            className="absolute overflow-hidden transition-all duration-300 group-hover:brightness-110 rounded-sm cursor-pointer touch-manipulation active:brightness-95"
            style={artworkPosition}
            onClick={handleExpandClick}
          >
            <img 
              src={userArtworkUrl}
              alt="Your AI-generated artwork"
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              style={{
                filter: 'brightness(0.95) contrast(1.05) saturate(1.1)'
              }}
              onLoad={() => console.log('✅ AI-generated artwork loaded successfully on canvas:', userArtworkUrl.substring(0, 50) + '...')}
              onError={(e) => console.error('❌ Failed to load AI-generated artwork on canvas:', userArtworkUrl, e)}
            />
          </div>
        )}
        
        {/* Loading state overlay */}
        {isLoading && (
          <div 
            className="absolute border-2 border-dashed border-purple-300 bg-purple-50/80 flex items-center justify-center text-purple-600 text-sm font-medium rounded-sm"
            style={artworkPosition}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <div>Generating AI artwork...</div>
            </div>
          </div>
        )}
        
        {/* Error state overlay */}
        {error && !userArtworkUrl && !isLoading && (
          <div 
            className="absolute border-2 border-dashed border-red-300 bg-red-50/80 flex items-center justify-center text-red-600 text-sm font-medium rounded-sm"
            style={artworkPosition}
          >
            <div className="text-center">
              <div className="text-xs">Failed to generate artwork</div>
            </div>
          </div>
        )}
        
        {/* Debug overlay when no artwork is available */}
        {!userArtworkUrl && !isLoading && !error && (
          <div 
            className="absolute border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center text-gray-600 text-sm font-medium rounded-sm"
            style={artworkPosition}
          >
            <div className="text-center">
              <div className="text-xs">Waiting for AI artwork...</div>
            </div>
          </div>
        )}
        
        {/* Hover overlay - Enhanced for touch devices */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
      
      {/* Premium Quality Section - Enhanced mobile layout */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-purple-100 mx-4 sm:mx-0">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <span className="font-medium text-purple-900 text-sm sm:text-base">Premium Quality</span>
        </div>
        <ul className="text-xs sm:text-sm text-purple-700 space-y-1">
          <li>• Museum-grade canvas material</li>
          <li>• Fade-resistant archival inks</li>
          <li>• Hand-stretched wooden frame</li>
          <li>• Ready to hang hardware included</li>
        </ul>
      </div>

      {/* Enhanced Lightbox for mobile with touch optimizations */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={userArtworkUrl || ''}
        imageAlt="Your AI-generated artwork - Full Size"
        title={`Your Canvas Preview - ${selectedOrientation.charAt(0).toUpperCase() + selectedOrientation.slice(1)} Orientation`}
      />
    </div>
  );
};

export default CanvasPreviewSection;

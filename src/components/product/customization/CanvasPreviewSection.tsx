
import { Sparkles } from "lucide-react";

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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Canvas Preview</h3>
        <p className="text-gray-600">Premium gallery-quality canvas with your AI-generated artwork</p>
      </div>
      
      {/* Expanded Canvas Mockup with User Artwork Overlay */}
      <div className="relative group">
        {/* Canvas Frame */}
        <img 
          src={canvasFrame}
          alt="Canvas Mockup" 
          className="w-full h-auto rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02]" 
        />
        
        {/* User's Generated Artwork Overlay */}
        {userArtworkUrl && !isLoading && (
          <div 
            className="absolute overflow-hidden transition-all duration-300 group-hover:brightness-110 rounded-sm"
            style={artworkPosition}
          >
            <img 
              src={userArtworkUrl}
              alt="Your AI-generated artwork"
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              style={{
                filter: 'brightness(0.95) contrast(1.05) saturate(1.1)'
              }}
              onLoad={() => console.log('✅ AI-generated artwork loaded successfully:', userArtworkUrl.substring(0, 50) + '...')}
              onError={(e) => console.error('❌ Failed to load AI-generated artwork:', userArtworkUrl, e)}
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
              <div className="text-xs">No artwork available</div>
            </div>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-purple-900">Premium Quality</span>
        </div>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• Museum-grade canvas material</li>
          <li>• Fade-resistant archival inks</li>
          <li>• Hand-stretched wooden frame</li>
          <li>• Ready to hang hardware included</li>
        </ul>
      </div>
    </div>
  );
};

export default CanvasPreviewSection;

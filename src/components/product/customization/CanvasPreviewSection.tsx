
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
}

const CanvasPreviewSection = ({
  userArtworkUrl,
  selectedOrientation,
  canvasFrame,
  artworkPosition
}: CanvasPreviewSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Canvas Preview</h3>
        <p className="text-gray-600">Premium gallery-quality canvas with your artwork</p>
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
        {userArtworkUrl && (
          <div 
            className="absolute overflow-hidden transition-all duration-300 group-hover:brightness-110 rounded-sm"
            style={artworkPosition}
          >
            <img 
              src={userArtworkUrl}
              alt="Your generated artwork"
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              style={{
                filter: 'brightness(0.95) contrast(1.05) saturate(1.1)'
              }}
              onLoad={() => console.log('✅ User artwork loaded successfully:', userArtworkUrl)}
              onError={(e) => console.error('❌ Failed to load user artwork:', userArtworkUrl, e)}
            />
          </div>
        )}
        
        {/* Debug overlay to show artwork position */}
        {!userArtworkUrl && (
          <div 
            className="absolute border-2 border-dashed border-red-300 bg-red-50/50 flex items-center justify-center text-red-600 text-sm font-medium"
            style={artworkPosition}
          >
            No artwork URL provided
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


import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Shield, Star, Zap } from "lucide-react";
import { useState } from "react";

interface ProductHeaderCTAProps {
  onUploadClick: () => void;
  onTriggerFileInput?: () => boolean;
}

const ProductHeaderCTA = ({ onUploadClick, onTriggerFileInput }: ProductHeaderCTAProps) => {
  const [isActivating, setIsActivating] = useState(false);

  const handleUploadClick = async () => {
    console.log('🎯 Hero button clicked - starting activation process');
    setIsActivating(true);
    
    // Activate Step 1 first
    onUploadClick();
    
    // Wait for the component to fully mount and trigger registration
    setTimeout(() => {
      console.log('🎯 Attempting to trigger file input after activation');
      const success = onTriggerFileInput?.();
      
      if (success) {
        console.log('✅ File input triggered successfully');
        
        // Scroll to step 1 after successful trigger
        setTimeout(() => {
          const step1Element = document.querySelector('[data-step="1"]');
          if (step1Element) {
            const elementTop = step1Element.getBoundingClientRect().top + window.pageYOffset;
            const offsetTop = elementTop - 120;
            
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          }
        }, 100);
      } else {
        console.log('❌ File input trigger failed - retrying...');
        
        // Retry mechanism - sometimes the component needs a bit more time
        let retryCount = 0;
        const maxRetries = 10;
        const retryInterval = setInterval(() => {
          const retrySuccess = onTriggerFileInput?.();
          retryCount++;
          
          if (retrySuccess || retryCount >= maxRetries) {
            clearInterval(retryInterval);
            if (retrySuccess) {
              console.log('✅ File input triggered successfully on retry', retryCount);
            } else {
              console.log('❌ File input trigger failed after all retries');
            }
          }
        }, 50);
      }
      
      setIsActivating(false);
    }, 300); // Increased timeout to ensure proper component mounting
  };

  return (
    <div className="flex flex-col items-center gap-6 mb-12">
      {/* Main CTA with Advanced Animation */}
      <div className="relative group">
        {/* Multi-layer glow system */}
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full blur-xl opacity-70 group-hover:opacity-90 animate-[magical-glow_4s_ease-in-out_infinite] transition-all duration-500"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 rounded-full blur-lg opacity-50 group-hover:opacity-70 animate-[magical-glow_3s_ease-in-out_infinite_reverse] transition-all duration-300"></div>
        
        {/* Enhanced floating particles system */}
        <div className="absolute inset-0 overflow-visible rounded-full pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 bg-yellow-${300 + (i % 2) * 100} rounded-full animate-[magical-particles_${4 + i}s_ease-in-out_infinite] opacity-80`}
              style={{
                top: `${20 + (i * 15) % 60}%`,
                left: `${15 + (i * 20) % 70}%`,
                animationDelay: `${i * 0.5}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* The Button - Conversion Optimized */}
        <Button 
          onClick={handleUploadClick} 
          disabled={isActivating}
          className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-16 py-8 text-2xl font-black rounded-full shadow-2xl hover:shadow-purple-500/50 transform hover:scale-[1.02] transition-all duration-300 border-2 border-white/20 backdrop-blur-sm group-hover:border-white/40 disabled:opacity-75"
        >
          <Upload className="w-7 h-7 mr-4" />
          {isActivating ? 'Opening File Picker...' : 'Upload Your Photo & Start Creating'}
          <Sparkles className={`w-6 h-6 ml-4 ${isActivating ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Urgency + Reassurance Under Button */}
      <div className="text-center space-y-2">
        <div className="text-purple-700 font-bold text-lg">
          ✨ Your masterpiece ready in under 2 minutes
        </div>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-green-500" />
            100% Secure
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            30-day guarantee
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-blue-500" />
            Instant preview
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductHeaderCTA;

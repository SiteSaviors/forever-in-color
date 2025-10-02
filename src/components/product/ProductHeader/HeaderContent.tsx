
import { Button } from "@/components/ui/button";
import { Upload, Sparkles } from "@/components/ui/icons";

interface HeaderContentProps {
  progressPercentage: number;
  onUploadClick: () => void;
}

const HeaderContent = ({ progressPercentage, onUploadClick }: HeaderContentProps) => {
  const handleUploadClick = () => {
    // Add subtle haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
      const uploadSection = document.querySelector('[data-step="1"]');
      if (uploadSection) {
        uploadSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
    onUploadClick?.();
  };

  return (
    <div className="text-center mb-5 md:mb-7">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight mb-1.5 md:mb-2.5 leading-[0.8] md:leading-[0.85]">
        <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-2xl hover:scale-105 transition-transform duration-200 inline-block">
          Create Your
        </span>
        <br />
        <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent drop-shadow-2xl premium-pulse hover:animate-none hover:scale-105 transition-all duration-200 inline-block">
          MASTERPIECE
        </span>
      </h1>
      
      <p className="font-poppins text-base sm:text-lg md:text-xl lg:text-2xl text-violet-100 max-w-4xl mx-auto mb-3 md:mb-5 leading-snug md:leading-relaxed font-semibold tracking-tight px-3 md:px-4 text-shadow-sm">
        Transform your precious memories into <span className="text-cyan-300 font-bold hover:text-cyan-200 transition-colors">stunning canvas art</span> with 
        <span className="text-fuchsia-300 font-bold hover:text-fuchsia-200 transition-colors"> AI-powered artistic styles</span>
      </p>

      {/* Phase 1: Mobile-Optimized CTA Button */}
      <Button 
        onClick={handleUploadClick} 
        className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 hover:from-fuchsia-600 hover:via-pink-600 hover:to-rose-600 text-white px-6 md:px-20 py-6 md:py-8 text-lg md:text-2xl lg:text-3xl font-black rounded-2xl shadow-2xl hover:shadow-fuchsia-500/30 transform hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/25 backdrop-blur-sm mb-1.5 md:mb-2.5 group relative overflow-hidden"
      >
        {/* Optimized animated background shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-800"></div>
        
        <Upload className="w-6 h-6 md:w-8 md:h-8 mr-3 group-hover:animate-bounce" />
        <span className="relative z-10">
          {/* Mobile-optimized text */}
          <span className="hidden md:inline">
            {progressPercentage === 0 ? 'Upload Photo & Start Creating' : 'Continue Your Masterpiece'}
          </span>
          <span className="md:hidden">
            {progressPercentage === 0 ? 'Upload & Create' : 'Continue'}
          </span>
        </span>
        <Sparkles className="w-6 h-6 md:w-8 md:h-8 ml-3 animate-pulse group-hover:animate-spin" />
      </Button>

      {/* Static Social Proof Message - Phase 5 optimization */}
      <p className="text-sm md:text-base text-white/80 text-center font-medium">
        ✨ Join 50K+ customers creating their masterpieces
      </p>
    </div>
  );
};

export default HeaderContent;

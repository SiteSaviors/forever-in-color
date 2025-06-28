
import { Button } from "@/components/ui/button";

interface HeroContentProps {
  onStartCreating: () => void;
}

const HeroContent = ({ onStartCreating }: HeroContentProps) => {
  return (
    <div className="text-center space-y-8 relative z-10">
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent leading-tight">
        Turn Your Photos Into Living Memories
      </h1>
      
      <p className="text-xl sm:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
        Transform your precious moments into <span className="font-semibold text-purple-600">stunning AI art</span> that captures not just how they looked, but how they felt.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
        <Button 
          onClick={onStartCreating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full"
          data-start-creating
        >
          Start Creating Magic ✨
        </Button>
        
        <div className="flex items-center space-x-2 text-gray-600">
          <span className="text-sm">🎨 12+ Art Styles</span>
          <span className="text-sm">⚡ 2-Min Process</span>
          <span className="text-sm">💝 Perfect Gifts</span>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;

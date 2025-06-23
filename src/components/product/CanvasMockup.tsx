
import CanvasWallMockup from "./CanvasWallMockup";

interface CanvasMockupProps {
  imageUrl: string;
  selectedSize: string;
  selectedOrientation: string;
  customizations: {
    floatingFrame: {
      enabled: boolean;
      color: 'white' | 'black' | 'espresso';
    };
  };
}

const CanvasMockup = ({ imageUrl, selectedSize, selectedOrientation, customizations }: CanvasMockupProps) => {
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12 min-h-[400px]">
      {/* Room Environment with realistic canvas */}
      <div className="relative">
        <CanvasWallMockup
          imageUrl={imageUrl}
          selectedSize={selectedSize}
          selectedOrientation={selectedOrientation}
          customizations={customizations}
          className="transform hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>
  );
};

export default CanvasMockup;

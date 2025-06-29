
import { useState } from "react";

interface MockupCanvasProps {
  imageUrl: string;
  size: string;
  orientation: string;
  styleName: string;
}

const MockupCanvas = ({ imageUrl, size, orientation, styleName }: MockupCanvasProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-lg">
        <div className="relative shadow-xl">
          <img
            src={imageUrl}
            alt={`${styleName} mockup`}
            className={`rounded-lg transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${orientation === 'horizontal' ? 'aspect-[4/3]' : 
               orientation === 'vertical' ? 'aspect-[3/4]' : 'aspect-square'}`}
            onLoad={() => setIsLoaded(true)}
          />
          
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-300 animate-pulse rounded-lg" />
          )}
          
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
            {size}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockupCanvas;

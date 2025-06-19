
import { Palette } from "lucide-react";

const CarouselHeader = () => {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center mb-4">
        <Palette className="w-8 h-8 text-purple-600 mr-3" />
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
          Explore Our{" "}
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Art Styles
          </span>
        </h2>
      </div>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Swipe to discover your perfect match — Each style transforms your photo into a unique masterpiece
      </p>
    </div>
  );
};

export default CarouselHeader;

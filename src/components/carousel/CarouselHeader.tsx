
import { Palette } from "lucide-react";

const CarouselHeader = () => {
  return (
    <div className="text-center mb-4 pt-12">
      <div className="flex items-center justify-center mb-3">
        <Palette className="w-12 h-12 text-purple-600 mr-4" />
        <h2 className="font-poppins lg:text-7xl font-bold text-gray-900 tracking-tighter text-5xl">
          Discover Your{" "}
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Signature Style
          </span>
        </h2>
      </div>
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-white text-lg lg:text-xl font-medium leading-relaxed tracking-wide font-serif drop-shadow-lg">
          Transform your photos into stunning canvas artwork with our curated collection of artistic styles. Each style is carefully crafted to bring out the unique beauty in your memories.
        </p>
      </div>
    </div>
  );
};

export default CarouselHeader;

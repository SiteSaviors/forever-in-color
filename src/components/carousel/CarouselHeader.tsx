
import { Palette } from "lucide-react";

const CarouselHeader = () => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-6">
        <Palette className="w-16 h-16 text-purple-600 mr-6" />
        <h2 className="font-poppins text-6xl lg:text-8xl font-bold text-gray-900 tracking-tighter">
          Discover Your{" "}
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Signature Style
          </span>
        </h2>
      </div>
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-white text-xl lg:text-2xl font-medium leading-relaxed tracking-wide font-serif drop-shadow-lg">
          Transform your photos into stunning canvas artwork with our curated collection of artistic styles. Each style is carefully crafted to bring out the unique beauty in your memories.
        </p>
      </div>
    </div>
  );
};

export default CarouselHeader;

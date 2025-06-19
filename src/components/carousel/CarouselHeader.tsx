
import { Palette } from "lucide-react";

const CarouselHeader = () => {
  return (
    <div className="text-center mb-16">
      <div className="flex items-center justify-center mb-4">
        <Palette className="w-8 h-8 text-purple-600 mr-3" />
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
          Discover Your{" "}
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Signature Style
          </span>
        </h2>
      </div>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Explore our curated collection of artistic styles — each one transforms your photo into a one-of-a-kind masterpiece
      </p>
    </div>
  );
};

export default CarouselHeader;

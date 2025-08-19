
import { Crop, Sparkles } from "lucide-react";

const CropperHeader = () => {
  return (
    <div className="text-center space-y-4">
      {/* Premium icon */}
      <div className="flex justify-center">
        <div className="relative p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl shadow-lg">
          <Crop className="w-8 h-8 text-purple-600" />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-pink-500 animate-pulse" />
        </div>
      </div>

      {/* Premium typography */}
      <div className="space-y-3">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
          Perfect Your
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ml-2">
            Composition
          </span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Adjust your photo and select the perfect canvas orientation. Our AI has detected the optimal crop for your image.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          <div className="w-6 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          <div className="w-2 h-2 bg-gray-200 rounded-full" />
        </div>
        <span className="text-sm text-gray-500 ml-3 font-medium">Step 1 of 4</span>
      </div>
    </div>
  );
};

export default CropperHeader;


import { ImageIcon, Camera, Sparkles, CheckCircle2 } from "lucide-react";

const UploadFeatures = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-purple-600" />
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-900">Smart Crop</div>
          <div className="text-xs text-gray-500">AI-powered framing</div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Camera className="w-6 h-6 text-blue-600" />
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-900">Any Format</div>
          <div className="text-xs text-gray-500">JPG, PNG, HEIC</div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-pink-600" />
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-900">AI Enhanced</div>
          <div className="text-xs text-gray-500">Professional quality</div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        </div>
        <div className="text-sm">
          <div className="font-medium text-gray-900">Secure</div>
          <div className="text-xs text-gray-500">Private & safe</div>
        </div>
      </div>
    </div>
  );
};

export default UploadFeatures;

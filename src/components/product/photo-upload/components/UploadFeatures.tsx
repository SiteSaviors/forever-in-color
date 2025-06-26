
import { ImageIcon, Camera, Sparkles, CheckCircle2 } from "lucide-react";

const UploadFeatures = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-purple-500" />
        <span>JPG, PNG, WebP</span>
      </div>
      <div className="flex items-center gap-2">
        <Camera className="w-4 h-4 text-purple-500" />
        <span>Up to 10MB</span>
      </div>
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span>Auto-Crop</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span>AI Enhanced</span>
      </div>
    </div>
  );
};

export default UploadFeatures;

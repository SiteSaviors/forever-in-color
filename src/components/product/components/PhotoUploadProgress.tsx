
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, Palette } from "lucide-react";

interface PhotoUploadProgressProps {
  hasImage: boolean;
  hasStyle: boolean;
  currentOrientation: string;
  selectedStyle: { id: number; name: string } | null;
}

const PhotoUploadProgress = ({
  hasImage,
  hasStyle,
  currentOrientation,
  selectedStyle
}: PhotoUploadProgressProps) => {
  return (
    <div className="flex items-center justify-center gap-8 mb-8">
      <div className={`flex items-center gap-2 ${hasImage ? 'text-green-600' : 'text-gray-400'}`}>
        {hasImage ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
        <span className="font-medium">Photo & Canvas</span>
        {hasImage && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
            ✓ {currentOrientation} selected
          </Badge>
        )}
      </div>
      
      <div className={`w-8 h-0.5 ${hasImage ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      
      <div className={`flex items-center gap-2 ${hasStyle ? 'text-green-600' : hasImage ? 'text-purple-600' : 'text-gray-400'}`}>
        <Palette className="w-5 h-5" />
        <span className="font-medium">Art Style</span>
        {hasStyle && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
            ✓ {selectedStyle?.name}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default PhotoUploadProgress;

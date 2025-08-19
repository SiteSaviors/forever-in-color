
import { Card, CardContent } from "@/components/ui/card";
import UploadDropzone from "./UploadDropzone";
import UploadProgress from "./UploadProgress";
import UploadFeatures from "./UploadFeatures";
import UploadCTA from "./UploadCTA";

interface PhotoUploadMainProps {
  isDragOver: boolean;
  isUploading: boolean;
  uploadProgress: number;
  processingStage: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PhotoUploadMain = ({
  isDragOver,
  isUploading,
  uploadProgress,
  processingStage,
  fileInputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  onFileChange
}: PhotoUploadMainProps) => {
  return (
    <Card className="w-full overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-0">
        <div className="relative">
          {/* Premium Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), 
                               radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 40% 80%, rgba(255, 204, 112, 0.1) 0%, transparent 50%)`
            }} />
          </div>

          <div className="relative p-8 lg:p-12">
            <UploadDropzone
              isDragOver={isDragOver}
              isUploading={isUploading}
              processingStage={processingStage}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={onClick}
              fileInputRef={fileInputRef}
              onFileChange={onFileChange}
            />
            
            {/* Progress Bar */}
            <UploadProgress uploadProgress={uploadProgress} isUploading={isUploading} />
            
            {/* Enhanced Features */}
            <div className="mt-6">
              <UploadFeatures />
            </div>
            
            {/* CTA Button */}
            <UploadCTA isUploading={isUploading} onClick={onClick} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUploadMain;

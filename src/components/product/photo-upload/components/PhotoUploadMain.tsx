
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
    <Card className="w-full overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-cyan-950/90 via-violet-900/90 to-fuchsia-950/90 backdrop-blur-xl">
      <CardContent className="p-0">
        <div className="relative">
          {/* Hero-style Premium Background Pattern */}
          <div className="absolute inset-0 opacity-[0.05]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20" />
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), 
                               radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)`
            }} />
          </div>
          
          {/* Hero-style floating shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50" />
          
          {/* Premium overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

          <div className="relative p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
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
            
            {/* Enhanced Features - Reduced margin */}
            <div className="mt-4">
              <UploadFeatures />
            </div>
            
            {/* CTA Button */}
            <UploadCTA isUploading={isUploading} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUploadMain;

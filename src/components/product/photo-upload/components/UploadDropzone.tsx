
import { Upload, Sparkles } from "lucide-react";
import { MobileButton } from "@/components/ui/mobile-button";
import { MobileTypography } from "@/components/ui/mobile-typography";

interface UploadDropzoneProps {
  isDragOver: boolean;
  isUploading: boolean;
  processingStage: string;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadDropzone = ({
  isDragOver,
  isUploading,
  processingStage,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  fileInputRef,
  onFileChange
}: UploadDropzoneProps) => {
  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-500 cursor-pointer group
        ${isDragOver 
          ? 'border-cyan-400 bg-gradient-to-br from-cyan-950/90 via-violet-900/90 to-fuchsia-950/90 scale-[1.02] shadow-2xl shadow-cyan-500/30 backdrop-blur-xl' 
          : 'border-cyan-300/30 hover:border-cyan-300/70 hover:bg-gradient-to-br hover:from-cyan-950/80 hover:via-violet-900/80 hover:to-fuchsia-950/80 hover:shadow-2xl hover:shadow-violet-500/20 hover:backdrop-blur-lg'
        }
        ${isUploading ? 'pointer-events-none' : ''}
      `}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={onClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFileChange}
        className="hidden"
      />
      
      <div className="space-y-4 sm:space-y-5">
          {/* Mobile-optimized CTA button with proper touch targets */}
          <div className="pt-2">
            <MobileButton 
              size="lg" 
              className="bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 hover:from-cyan-700 hover:via-violet-700 hover:to-fuchsia-700 text-white font-black font-montserrat shadow-2xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 w-full sm:w-auto min-h-[48px] px-4 sm:px-8 py-4 text-base sm:text-lg sm:text-xl backdrop-blur-sm"
              disabled={isUploading}
              onClick={onClick}
            >
              {isUploading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 sm:mr-3 animate-spin" />
                  <span className="tracking-wide">CREATING MAGIC</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2 sm:mr-3" />
                  <span className="tracking-wide sm:hidden">UPLOAD PHOTO</span>
                  <span className="tracking-wide hidden sm:inline">TRANSFORM YOUR PHOTO</span>
                </>
              )}
            </MobileButton>
          </div>
      </div>

      {/* Hero-style premium glow effect */}
      <div className={`
        absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 transition-all duration-500
        ${isDragOver || isUploading ? 'opacity-100' : 'group-hover:opacity-60'}
      `}>
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-400/30 via-violet-400/30 to-fuchsia-400/30 blur-xl" />
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 blur-2xl" />
      </div>
    </div>
  );
};

export default UploadDropzone;

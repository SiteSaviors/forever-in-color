
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
          ? 'border-cyan-400 bg-gradient-to-br from-cyan-950/90 via-violet-900/90 to-fuchsia-950/90 scale-[1.02] shadow-2xl shadow-cyan-500/30' 
          : 'border-gray-300/50 hover:border-cyan-300/70 hover:bg-gradient-to-br hover:from-cyan-950/80 hover:via-violet-900/80 hover:to-fuchsia-950/80 hover:shadow-xl hover:shadow-violet-500/20'
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
        {/* Icon Section - Reduced size */}
        <div className="flex justify-center">
          <div className={`
            relative p-3 sm:p-4 rounded-full transition-all duration-500
            ${isDragOver 
              ? 'bg-gradient-to-br from-cyan-500 to-fuchsia-500 scale-110 shadow-2xl shadow-cyan-400/50' 
              : 'bg-gradient-to-br from-cyan-100/80 to-fuchsia-100/80 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-violet-400/30'
            }
          `}>
            {isUploading ? (
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
              </div>
            ) : (
              <Upload className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 ${
                isDragOver ? 'text-white' : 'text-cyan-600 group-hover:text-fuchsia-600'
              }`} />
            )}
            
            {/* Floating particles effect - hidden on small screens */}
            {isDragOver && (
              <>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-fuchsia-400 rounded-full animate-bounce hidden sm:block" />
                <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150 hidden sm:block" />
                <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-300 hidden sm:block" />
              </>
            )}
          </div>
        </div>
        
          {/* Mobile-optimized CTA button with proper touch targets */}
          <div className="pt-2">
            <MobileButton 
              size="lg" 
              className="bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 hover:from-cyan-700 hover:via-violet-700 hover:to-fuchsia-700 text-white font-black font-montserrat shadow-2xl hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 w-full sm:w-auto min-h-[48px] px-8 py-4 text-lg sm:text-xl backdrop-blur-sm"
              disabled={isUploading}
              onClick={onClick}
            >
              {isUploading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-3 animate-spin" />
                  <span className="tracking-wide">CREATING MAGIC</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-3" />
                  <span className="tracking-wide">TRANSFORM YOUR PHOTO</span>
                </>
              )}
            </MobileButton>
          </div>
      </div>

      {/* Premium glow effect */}
      <div className={`
        absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 transition-opacity duration-500
        ${isDragOver ? 'opacity-100' : 'group-hover:opacity-50'}
      `}>
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-400/20 via-violet-400/20 to-fuchsia-400/20 blur-xl" />
      </div>
    </div>
  );
};

export default UploadDropzone;

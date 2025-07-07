
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
          ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 scale-[1.02] shadow-xl' 
          : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 hover:shadow-lg'
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
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110 shadow-2xl' 
              : 'bg-gradient-to-br from-purple-100 to-pink-100 group-hover:scale-105 group-hover:shadow-xl'
            }
          `}>
            {isUploading ? (
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
              </div>
            ) : (
              <Upload className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 ${
                isDragOver ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'
              }`} />
            )}
            
            {/* Floating particles effect - hidden on small screens */}
            {isDragOver && (
              <>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-pink-400 rounded-full animate-bounce hidden sm:block" />
                <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150 hidden sm:block" />
                <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-300 hidden sm:block" />
              </>
            )}
          </div>
        </div>
        
        {/* Content Section - Reduced spacing */}
        <div className="space-y-2 sm:space-y-3">
          <div className="space-y-1 sm:space-y-2">
            <MobileTypography variant="h2" className="tracking-tight text-xl sm:text-2xl lg:text-3xl">
              {isUploading ? (
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {processingStage || "Processing..."}
                </span>
              ) : isDragOver ? (
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Drop to Create Magic ✨
                </span>
              ) : (
                "Transform Your Photo Into Art"
              )}
            </MobileTypography>
            
            <MobileTypography variant="body" className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
              {isUploading 
                ? "AI is analyzing your photo for the perfect composition and canvas format"
                : "Upload your favorite photo and our AI will instantly find the perfect crop and canvas orientation"
              }
            </MobileTypography>
          </div>
          
          {/* Mobile-optimized CTA button with proper touch targets */}
          <div className="pt-3 sm:pt-4">
            <MobileButton 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 w-full sm:w-auto min-h-[48px] px-6 py-3 text-base sm:text-lg font-poppins-tight"
              disabled={isUploading}
              onClick={onClick}
            >
              {isUploading ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Your Photo
                </>
              )}
            </MobileButton>
          </div>
        </div>
      </div>

      {/* Premium glow effect */}
      <div className={`
        absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 transition-opacity duration-500
        ${isDragOver ? 'opacity-100' : 'group-hover:opacity-50'}
      `}>
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl" />
      </div>
    </div>
  );
};

export default UploadDropzone;


import { Upload, Sparkles } from "lucide-react";

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
        relative border-2 border-dashed rounded-2xl p-8 lg:p-16 text-center transition-all duration-500 cursor-pointer group
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
        onChange={onFileChange}
        className="hidden"
      />
      
      <div className="space-y-8">
        {/* Icon Section with Animation */}
        <div className="flex justify-center">
          <div className={`
            relative p-6 rounded-full transition-all duration-500
            ${isDragOver 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 scale-110 shadow-2xl' 
              : 'bg-gradient-to-br from-purple-100 to-pink-100 group-hover:scale-105 group-hover:shadow-xl'
            }
          `}>
            {isUploading ? (
              <div className="relative">
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-white animate-pulse" />
              </div>
            ) : (
              <Upload className={`w-16 h-16 transition-colors duration-300 ${
                isDragOver ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'
              }`} />
            )}
            
            {/* Floating particles effect */}
            {isDragOver && (
              <>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-pink-400 rounded-full animate-bounce" />
                <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
                <div className="absolute top-1/2 -right-3 w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-300" />
              </>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
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
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              {isUploading 
                ? "AI is analyzing your photo for the perfect composition and canvas format"
                : "Upload your favorite photo and our AI will instantly find the perfect crop and canvas orientation"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Premium glow effect */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500
        ${isDragOver ? 'opacity-100' : 'group-hover:opacity-50'}
      `}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl" />
      </div>
    </div>
  );
};

export default UploadDropzone;

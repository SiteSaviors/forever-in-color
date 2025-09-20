
interface UploadProgressProps {
  uploadProgress: number;
  isUploading: boolean;
}

const UploadProgress = ({ uploadProgress, isUploading }: UploadProgressProps) => {
  if (!isUploading) return null;

  return (
    <div className="max-w-xs mx-auto space-y-2">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 font-medium">{uploadProgress}% complete</p>
    </div>
  );
};

export default UploadProgress;

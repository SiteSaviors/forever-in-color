
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, CheckCircle2 } from "lucide-react";

interface UploadCTAProps {
  isUploading: boolean;
  onClick: () => void;
}

const UploadCTA = ({
  isUploading,
  onClick
}: UploadCTAProps) => {
  return (
    <div className="mt-8 text-center space-y-6">
      {/* Main CTA Button */}
      {!isUploading && (
        <Button 
          onClick={onClick}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Upload className="w-5 h-5 mr-2" />
          Choose Your Photo
        </Button>
      )}

      {/* Trust indicators */}
      <div className="mt-8 flex items-center justify-center gap-8 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          <span>Secure Upload</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span>AI Powered</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          <span>100% Private</span>
        </div>
      </div>
    </div>
  );
};

export default UploadCTA;

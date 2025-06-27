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
  return <div className="mt-8 text-center space-y-6">
      
      
      {!isUploading}

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
    </div>;
};
export default UploadCTA;
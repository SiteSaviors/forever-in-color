import { Button } from "@/components/ui/button";
import { Upload, Sparkles, CheckCircle2 } from "lucide-react";

interface UploadCTAProps {
  isUploading: boolean;
  onClick: () => void;
}

const UploadCTA = ({ isUploading, onClick }: UploadCTAProps) => {
  return (
    <div className="mt-8 text-center space-y-6">
      <Button
        size="lg"
        onClick={onClick}
        disabled={isUploading}
        className="bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 hover:from-cyan-700 hover:via-violet-700 hover:to-fuchsia-700 text-white font-semibold px-8 py-6 rounded-xl shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300"
      >
        {isUploading ? (
          <>
            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
            Preparing your canvas...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-5 w-5" />
            Transform your photo now
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-sm text-white/80">
        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
        <span>30-day happiness guarantee &bull; Secure uploads</span>
      </div>
    </div>
  );
};

export default UploadCTA;

import { Sparkles, CheckCircle2 } from "@/components/ui/icons";

interface UploadCTAProps {
  isUploading: boolean;
}

const UploadCTA = ({ isUploading }: UploadCTAProps) => {
  return (
    <div className="mt-8 flex flex-col items-center gap-3 text-sm text-white/80">
      {isUploading ? (
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="h-4 w-4 animate-spin text-cyan-200" />
          <span>Uploading your photo&mdash;sit tight while we work our magic</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <span>30-day happiness guarantee &bull; Secure uploads</span>
        </div>
      )}
    </div>
  );
};

export default UploadCTA;

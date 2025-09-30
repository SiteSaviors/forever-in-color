import { Button } from "@/components/ui/button";
interface UploadCTAProps {
  isUploading: boolean;
  onClick: () => void;
}
const UploadCTA = ({
  isUploading,
  onClick
}: UploadCTAProps) => {
  return <div className="mt-8 text-center space-y-6">
      {/* Main CTA Button */}
      {!isUploading}

      {/* Trust indicators */}
      
    </div>;
};
export default UploadCTA;

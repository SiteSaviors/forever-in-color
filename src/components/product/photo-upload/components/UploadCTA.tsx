
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadCTAProps {
  onImageUpload: (file: File) => Promise<void>;
}

const UploadCTA = ({ onImageUpload }: UploadCTAProps) => {
  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await onImageUpload(file);
      }
    };
    input.click();
  };

  return (
    <div className="text-center">
      <Button 
        onClick={handleClick}
        size="lg" 
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Upload className="mr-2 h-5 w-5" />
        Choose Your Photo
      </Button>
      <p className="mt-3 text-sm text-gray-500">
        Transform any photo into stunning canvas art with AI
      </p>
    </div>
  );
};

export default UploadCTA;


import { memo } from "react";
import Lightbox from "@/components/ui/lightbox";

interface EnhancedStyleCardLightboxesProps {
  isImageLightboxOpen: boolean;
  isCanvasLightboxOpen: boolean;
  onImageLightboxClose: () => void;
  onCanvasLightboxClose: () => void;
  imageUrl: string;
  styleName: string;
  canvasPreviewContent?: React.ReactNode;
}

const EnhancedStyleCardLightboxes = memo(({
  isImageLightboxOpen,
  isCanvasLightboxOpen,
  onImageLightboxClose,
  onCanvasLightboxClose,
  imageUrl,
  styleName,
  canvasPreviewContent
}: EnhancedStyleCardLightboxesProps) => {
  return (
    <>
      <Lightbox
        isOpen={isImageLightboxOpen}
        onClose={onImageLightboxClose}
        imageSrc={imageUrl}
        imageAlt={`${styleName} preview`}
        title={styleName}
      />
      
      <Lightbox
        isOpen={isCanvasLightboxOpen}
        onClose={onCanvasLightboxClose}
        imageSrc=""
        imageAlt="Canvas preview"
        title="Canvas Preview"
        customContent={canvasPreviewContent}
      />
    </>
  );
});

EnhancedStyleCardLightboxes.displayName = 'EnhancedStyleCardLightboxes';

export default EnhancedStyleCardLightboxes;

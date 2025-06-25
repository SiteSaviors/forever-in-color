
import { useState } from "react";
import Lightbox from "@/components/ui/lightbox";
import FullCanvasMockup from "./FullCanvasMockup";

interface StyleCardLightboxesProps {
  style: {
    id: number;
    name: string;
  };
  finalPreviewUrl: string | null;
  croppedImage: string | null;
  selectedOrientation: string;
  onExpandClick?: (e: React.MouseEvent) => void;
  onCanvasPreviewClick?: (e: React.MouseEvent) => void;
}

const StyleCardLightboxes = ({
  style,
  finalPreviewUrl,
  croppedImage,
  selectedOrientation,
  onExpandClick,
  onCanvasPreviewClick
}: StyleCardLightboxesProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCanvasLightboxOpen, setIsCanvasLightboxOpen] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (finalPreviewUrl || croppedImage) {
      setIsLightboxOpen(true);
    }
    if (onExpandClick) {
      onExpandClick(e);
    }
  };

  const handleCanvasPreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (finalPreviewUrl || croppedImage) {
      setIsCanvasLightboxOpen(true);
    }
    if (onCanvasPreviewClick) {
      onCanvasPreviewClick(e);
    }
  };

  // Expose handlers to parent component
  React.useEffect(() => {
    if (onExpandClick) {
      (window as any)[`expandHandler_${style.id}`] = handleExpandClick;
    }
    if (onCanvasPreviewClick) {
      (window as any)[`canvasHandler_${style.id}`] = handleCanvasPreviewClick;
    }
  }, [style.id]);

  return (
    <>
      {/* Regular Image Lightbox */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        imageSrc={finalPreviewUrl || croppedImage || ''}
        imageAlt={`${style.name} preview`}
        title={style.name}
      />

      {/* Canvas Preview Lightbox */}
      <Lightbox
        isOpen={isCanvasLightboxOpen}
        onClose={() => setIsCanvasLightboxOpen(false)}
        imageSrc=""
        imageAlt={`${style.name} canvas preview`}
        title={`${style.name} on Canvas`}
        customContent={
          <FullCanvasMockup
            imageUrl={finalPreviewUrl || croppedImage || ''}
            orientation={selectedOrientation}
            styleName={style.name}
          />
        }
      />
    </>
  );
};

export default StyleCardLightboxes;

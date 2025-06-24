
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
}

const StyleCardLightboxes = ({
  style,
  finalPreviewUrl,
  croppedImage,
  selectedOrientation
}: StyleCardLightboxesProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isCanvasLightboxOpen, setIsCanvasLightboxOpen] = useState(false);

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (finalPreviewUrl || croppedImage) {
      setIsLightboxOpen(true);
    }
  };

  const handleCanvasPreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (finalPreviewUrl || croppedImage) {
      setIsCanvasLightboxOpen(true);
    }
  };

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

      {/* Return handlers for parent component */}
      <div style={{ display: 'none' }}>
        {JSON.stringify({ handleExpandClick, handleCanvasPreviewClick })}
      </div>
    </>
  );
};

export default StyleCardLightboxes;

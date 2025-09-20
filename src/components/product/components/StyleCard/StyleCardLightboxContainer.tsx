
import React from "react";
import StyleCardLightboxes from "../StyleCardLightboxes";
import Lightbox from "@/components/ui/lightbox";
import FullCanvasMockup from "../FullCanvasMockup";

interface StyleCardLightboxContainerProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  finalPreviewUrl: string | null;
  croppedImage: string | null;
  selectedOrientation: string;
  isLightboxOpen: boolean;
  isCanvasLightboxOpen: boolean;
  onExpandClick: () => void;
  onCanvasPreviewClick: () => void;
  onCloseLightbox: () => void;
  onCloseCanvasLightbox: () => void;
}

const StyleCardLightboxContainer = React.memo(({
  style,
  finalPreviewUrl,
  croppedImage,
  selectedOrientation,
  isLightboxOpen,
  isCanvasLightboxOpen,
  onExpandClick,
  onCanvasPreviewClick,
  onCloseLightbox,
  onCloseCanvasLightbox
}: StyleCardLightboxContainerProps) => {
  return (
    <>
      <StyleCardLightboxes
        style={style}
        finalPreviewUrl={finalPreviewUrl}
        croppedImage={croppedImage}
        selectedOrientation={selectedOrientation}
        onExpandClick={onExpandClick}
        onCanvasPreviewClick={onCanvasPreviewClick}
      />

      {/* Lightboxes */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={onCloseLightbox}
        imageSrc={finalPreviewUrl || croppedImage || ''}
        imageAlt={`${style.name} preview`}
        title={style.name}
      />

      <Lightbox
        isOpen={isCanvasLightboxOpen}
        onClose={onCloseCanvasLightbox}
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
});

StyleCardLightboxContainer.displayName = 'StyleCardLightboxContainer';

export default StyleCardLightboxContainer;

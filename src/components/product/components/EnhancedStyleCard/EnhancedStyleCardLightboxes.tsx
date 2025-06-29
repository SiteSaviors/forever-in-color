
import React from 'react';
import Lightbox from '@/components/ui/lightbox';
import FullCanvasMockup from '../FullCanvasMockup';

interface EnhancedStyleCardLightboxesProps {
  showCanvasPreview: boolean;
  showLightbox: boolean;
  imageToShow: string;
  styleName: string;
  selectedOrientation: string;
  onCloseCanvasPreview: () => void;
  onCloseLightbox: () => void;
}

const EnhancedStyleCardLightboxes = ({
  showCanvasPreview,
  showLightbox,
  imageToShow,
  styleName,
  selectedOrientation,
  onCloseCanvasPreview,
  onCloseLightbox
}: EnhancedStyleCardLightboxesProps) => {
  return (
    <>
      {/* Canvas Preview Lightbox */}
      <Lightbox
        isOpen={showCanvasPreview}
        onClose={onCloseCanvasPreview}
        imageSrc=""
        imageAlt={`${styleName} canvas preview`}
        title={`${styleName} on Canvas`}
        customContent={
          <FullCanvasMockup
            imageUrl={imageToShow}
            orientation={selectedOrientation}
            styleName={styleName}
          />
        }
      />

      {/* Full Size Lightbox */}
      <Lightbox
        isOpen={showLightbox}
        onClose={onCloseLightbox}
        imageSrc={imageToShow}
        imageAlt={`${styleName} preview`}
        title={styleName}
      />
    </>
  );
};

export default EnhancedStyleCardLightboxes;

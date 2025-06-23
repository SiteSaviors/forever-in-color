
import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
  title?: string;
}

const Lightbox = ({ isOpen, onClose, imageSrc, imageAlt, title }: LightboxProps) => {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setIsZoomed(false);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-0"
        onKeyDown={handleKeyDown}
      >
        <div className="relative flex items-center justify-center min-h-[50vh] max-h-[95vh]">
          {/* Close Button */}
          <DialogClose className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors">
            <X className="w-6 h-6" />
          </DialogClose>

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button
              onClick={toggleZoom}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
              title={isZoomed ? "Zoom Out" : "Zoom In"}
            >
              {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>
          </div>

          {/* Title */}
          {title && (
            <div className="absolute bottom-4 left-4 z-10">
              <h3 className="text-white text-lg font-semibold bg-black/50 px-3 py-1 rounded">
                {title}
              </h3>
            </div>
          )}

          {/* Image */}
          <div className={`transition-transform duration-300 ${isZoomed ? 'scale-150' : 'scale-100'} overflow-auto max-w-full max-h-full`}>
            <img
              src={imageSrc}
              alt={imageAlt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              style={{ 
                cursor: isZoomed ? 'zoom-out' : 'zoom-in'
              }}
              onClick={toggleZoom}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Lightbox;

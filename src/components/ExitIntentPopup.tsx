
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";

const ExitIntentPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Detect if mouse is moving towards the top of the screen (exit intent)
      if (e.clientY <= 0 && !hasTriggered) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    };

    const handleBeforeUnload = () => {
      if (!hasTriggered) {
        setIsOpen(true);
        setHasTriggered(true);
      }
    };

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasTriggered]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Empty dialog for now - content can be added later if needed */}
    </Dialog>
  );
};

export default ExitIntentPopup;

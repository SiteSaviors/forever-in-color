import { useState, useEffect } from "react";
import { X, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const handleGetDiscount = () => {
    // Apply discount code logic here
    console.log('Discount applied: SAVE20');
    setIsOpen(false);

    // Scroll to the start creating section or open product page
    const startButton = document.querySelector('[data-start-creating]');
    if (startButton) {
      startButton.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  if (!isOpen) return null;
  return <Dialog open={isOpen} onOpenChange={setIsOpen}>
      
    </Dialog>;
};
export default ExitIntentPopup;
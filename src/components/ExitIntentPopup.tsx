
import { useState, useEffect } from "react";
import { X, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      startButton.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Gift className="w-8 h-8 text-white" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Wait! Don't Leave Empty-Handed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-lg text-gray-700">
              Get <span className="font-bold text-purple-600">20% OFF</span> your first canvas
            </p>
            <p className="text-sm text-gray-600">
              Plus <span className="font-semibold">FREE shipping</span> on orders over $99
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-gray-600 mb-2">Use code:</div>
            <div className="text-xl font-bold text-purple-600 tracking-widest">
              SAVE20
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleGetDiscount}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 shadow-lg"
              size="lg"
            >
              Claim My Discount
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <button
              onClick={handleClose}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              No thanks, I'll pay full price
            </button>
          </div>

          <div className="text-xs text-gray-500">
            * Offer valid for new customers only. Expires in 24 hours.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;

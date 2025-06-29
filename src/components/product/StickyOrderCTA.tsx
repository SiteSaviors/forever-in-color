
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface StickyOrderCTAProps {
  selectedStyle: number | null;
  selectedSize: string | null;
  price: number;
  onOrder: () => void;
}

const StickyOrderCTA = ({ selectedStyle, selectedSize, price, onOrder }: StickyOrderCTAProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!selectedStyle || !selectedSize || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <p className="font-semibold">{selectedSize} Canvas</p>
            <p className="text-sm text-gray-600">Style Selected</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">${price}</p>
            <p className="text-sm text-gray-600">Free Shipping</p>
          </div>
          
          <Button 
            size="lg" 
            onClick={onOrder}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Order Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyOrderCTA;

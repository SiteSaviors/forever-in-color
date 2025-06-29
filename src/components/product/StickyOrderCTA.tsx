
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface StickyOrderCTAProps {
  total: number;
  isVisible: boolean;
  onPlaceOrder: () => void;
}

const StickyOrderCTA = ({ total, isVisible, onPlaceOrder }: StickyOrderCTAProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <p className="font-semibold">Canvas Ready</p>
            <p className="text-sm text-gray-600">Review your order</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">${total}</p>
            <p className="text-sm text-gray-600">Free Shipping</p>
          </div>
          
          <Button 
            size="lg" 
            onClick={onPlaceOrder}
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

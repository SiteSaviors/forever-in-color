
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Palette, Package } from "lucide-react";

interface ProductHeaderProps {
  completedSteps: number[];
  totalSteps: number;
  currentStep: number;
  onUploadClick: () => void;
}

const ProductHeader = ({ completedSteps, totalSteps, currentStep, onUploadClick }: ProductHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stepIcons = [Upload, Sparkles, Palette, Package];
  const stepLabels = ["Upload", "Style", "Size", "Order"];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Create Your Art
              </h1>
              
              <div className="flex items-center space-x-3">
                {Array.from({ length: totalSteps }, (_, index) => {
                  const stepNumber = index + 1;
                  const IconComponent = stepIcons[index];
                  const isCompleted = completedSteps.includes(stepNumber);
                  const isCurrent = currentStep === stepNumber;
                  
                  return (
                    <div key={stepNumber} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isCurrent 
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-500'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {stepLabels[index]}
                      </span>
                      {index < totalSteps - 1 && (
                        <div className="ml-3 w-8 h-0.5 bg-gray-200" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🚀 Fast 5-7 Day Delivery
              </Badge>
              
              {currentStep === 1 && (
                <Button 
                  onClick={onUploadClick}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Upload Photo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;


import { Check, ChevronRight, ChevronDown, CheckCircle, Edit3 } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { useState } from "react";
import { triggerHapticFeedback } from "./ProductStepUtils";

interface CompletedStepViewProps {
  stepNumber: number;
  title: string;
  selectedStyle?: { id: number; name: string } | null;
  completedPreview?: React.ReactNode;
  onStepClick: () => void;
}

const CompletedStepView = ({
  stepNumber,
  title,
  selectedStyle,
  completedPreview,
  onStepClick
}: CompletedStepViewProps) => {
  const [isCollapsedOpen, setIsCollapsedOpen] = useState(false);

  const handleEditSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHapticFeedback();
    onStepClick();
  };

  const toggleCollapsedPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsedOpen(!isCollapsedOpen);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden transition-all duration-300 hover:shadow-md mb-4">
      {/* Success gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/30 pointer-events-none" />
      
      {/* Collapsed Header */}
      <div className="px-6 md:px-8 py-4 md:py-5">
        <div className="flex items-center gap-4 md:gap-6">
          {/* Success Icon */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg flex items-center justify-center">
              <Check className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          
          {/* Collapsed Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 font-poppins">
                {title}
                {stepNumber === 1 && selectedStyle && (
                  <span className="text-green-600 ml-3 font-medium text-base md:text-lg">- {selectedStyle.name}</span>
                )}
              </h3>
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            </div>
            
            {/* Completed preview summary */}
            {completedPreview && (
              <div className="text-sm text-gray-600 mb-2">
                Step completed successfully
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 px-3 py-1 text-sm font-medium rounded-full">
              ✓ Complete
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditSelection}
              className="min-h-[44px] min-w-[44px] px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 transition-all duration-200 rounded-xl border border-green-200 hover:border-green-300 hover:shadow-sm"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            
            {/* Expand/Collapse Button */}
            {completedPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapsedPreview}
                className="min-h-[44px] min-w-[44px] p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-xl"
              >
                {isCollapsedOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>
        
        {/* Collapsible Preview */}
        {completedPreview && (
          <Collapsible open={isCollapsedOpen}>
            <CollapsibleContent className="animate-accordion-down">
              <div className="mt-4 pt-4 border-t border-green-100">
                <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/30 rounded-xl p-4 border border-green-100">
                  {completedPreview}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
};

export default CompletedStepView;

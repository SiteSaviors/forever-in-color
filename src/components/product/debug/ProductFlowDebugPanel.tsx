
import React, { useState } from 'react';
import { X, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface ProductFlowDebugPanelProps {
  currentStep: number;
  completedSteps: number[];
  uploadedImage: string | null;
  selectedStyle: { id: number; name: string } | null;
  selectedSize: string;
  selectedOrientation: string;
  customizations: any;
  onJumpToStep: (step: number) => void;
}

const ProductFlowDebugPanel = ({
  currentStep,
  completedSteps,
  uploadedImage,
  selectedStyle,
  selectedSize,
  selectedOrientation,
  customizations,
  onJumpToStep
}: ProductFlowDebugPanelProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const captureStateSnapshot = () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      currentStep,
      completedSteps: [...completedSteps],
      state: {
        hasImage: !!uploadedImage,
        imageUrl: uploadedImage ? `${uploadedImage.substring(0, 50)}...` : null,
        selectedStyle: selectedStyle ? `ID:${selectedStyle.id} - ${selectedStyle.name}` : null,
        selectedSize: selectedSize || 'none',
        selectedOrientation: selectedOrientation || 'none',
        customizationsCount: customizations ? Object.keys(customizations).length : 0,
        customizationsDetail: customizations
      },
      validation: {
        canProceedStep2: !!uploadedImage && !!selectedStyle,
        canProceedStep3: !!selectedSize && !!selectedOrientation,
        canProceedStep4: true // customizations are optional
      }
    };
    
    console.group('🔍 Product Flow State Snapshot');
    console.log('Full State:', snapshot);
    console.log('Current Step:', currentStep);
    console.log('Completed Steps:', completedSteps);
    console.log('Image Status:', uploadedImage ? '✅ Uploaded' : '❌ Missing');
    console.log('Style Status:', selectedStyle ? `✅ ${selectedStyle.name}` : '❌ Not selected');
    console.log('Size Status:', selectedSize ? `✅ ${selectedSize}` : '❌ Not selected');
    console.log('Orientation:', selectedOrientation);
    console.groupEnd();
    
    // Also show an alert to confirm the button worked
    alert(`State captured! Check console for details.\nStep: ${currentStep}, Image: ${!!uploadedImage}, Style: ${selectedStyle?.name || 'none'}`);
    
    return snapshot;
  };

  const getStepStatus = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) return '✅';
    if (currentStep === stepNumber) return '🔄';
    return '⏸️';
  };

  const getStepHealth = () => {
    const issues = [];
    if (currentStep > 1 && !uploadedImage) issues.push('Missing image');
    if (currentStep > 1 && !selectedStyle) issues.push('No style selected');
    if (currentStep > 2 && !selectedSize) issues.push('No size selected');
    return issues;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 z-50"
        title="Open Debug Panel"
      >
        <Eye className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-w-sm">
      {/* Header */}
      <div className="bg-purple-600 text-white p-2 rounded-t-lg flex items-center justify-between">
        <span className="text-sm font-semibold">Debug Panel</span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:text-gray-200"
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {/* Step Status */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Flow Status</h4>
            <div className="space-y-1">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex items-center justify-between text-xs">
                  <span className="flex items-center space-x-1">
                    <span>{getStepStatus(step)}</span>
                    <span>Step {step}</span>
                  </span>
                  <button
                    onClick={() => onJumpToStep(step)}
                    className="text-purple-600 hover:text-purple-800"
                    title={`Jump to Step ${step}`}
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Health Check */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Health Check</h4>
            {getStepHealth().length === 0 ? (
              <div className="text-green-600 text-xs">✅ All systems normal</div>
            ) : (
              <div className="space-y-1">
                {getStepHealth().map((issue, index) => (
                  <div key={index} className="text-red-600 text-xs">⚠️ {issue}</div>
                ))}
              </div>
            )}
          </div>

          {/* State Summary */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">State Summary</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div>Image: {uploadedImage ? '✅' : '❌'}</div>
              <div>Style: {selectedStyle ? `${selectedStyle.name}` : '❌'}</div>
              <div>Size: {selectedSize || '❌'}</div>
              <div>Orientation: {selectedOrientation}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-2">
            <button
              onClick={captureStateSnapshot}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded text-xs transition-colors"
            >
              📸 Capture State Snapshot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFlowDebugPanel;

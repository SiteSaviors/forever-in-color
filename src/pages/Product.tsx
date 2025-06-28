
import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductHeader from "@/components/product/ProductHeader";
import ProductContent from "@/components/product/ProductContent";
import TrustElements from "@/components/product/TrustElements";
import BottomMomentumPopup from "@/components/product/components/BottomMomentumPopup";
import ProductTestimonials from "@/components/product/ProductTestimonials";
import UnifiedSocialMomentumWidget from "@/components/product/components/UnifiedSocialMomentumWidget";
import { useProductState } from "@/components/product/ProductStateManager";
import { ProgressOrchestrator } from "@/components/product/progress/ProgressOrchestrator";
import { preloadCriticalImages } from "@/utils/performanceUtils";
import { PhotoUploadStepRef } from "@/components/product/components/PhotoUploadStep";

const Product = () => {
  const photoUploadStepRef = useRef<PhotoUploadStepRef>(null);
  
  const {
    currentStep,
    completedSteps,
    selectedStyle,
    uploadedImage,
    selectedSize,
    selectedOrientation,
    customizations,
    autoGenerationComplete,
    setCurrentStep,
    handlePhotoAndStyleComplete,
    handleSizeSelect,
    handleOrientationSelect,
    handleCustomizationChange
  } = useProductState();

  // Preload critical resources on page load
  useEffect(() => {
    const initializePage = async () => {
      try {
        console.log('🚀 Preloading critical images for Product page...');
        await preloadCriticalImages((progress) => {
          if (progress === 100) {
            console.log('✅ Critical images preloaded successfully');
          }
        });
      } catch (error) {
        console.warn('⚠️ Critical image preloading failed:', error);
      }
    };

    initializePage();
  }, []);

  const handleUploadClick = () => {
    console.log('🎯 Hero button clicked - activating Step 1');
    setCurrentStep(1);
  };

  const handleTriggerFileInput = () => {
    console.log('🎯 Attempting to trigger file input...');
    return photoUploadStepRef.current?.triggerFileInput() || false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <ProgressOrchestrator>
        <div className="pt-16">
          <ProductHeader 
            completedSteps={completedSteps}
            totalSteps={4}
            currentStep={currentStep}
            onUploadClick={handleUploadClick}
            onTriggerFileInput={handleTriggerFileInput}
          />
          
          <TrustElements />
          
          <ProductContent
            currentStep={currentStep}
            completedSteps={completedSteps}
            selectedStyle={selectedStyle}
            selectedSize={selectedSize}
            selectedOrientation={selectedOrientation}
            customizations={customizations}
            uploadedImage={uploadedImage}
            autoGenerationComplete={autoGenerationComplete}
            onCurrentStepChange={setCurrentStep}
            onPhotoAndStyleComplete={handlePhotoAndStyleComplete}
            onOrientationSelect={handleOrientationSelect}
            onSizeSelect={handleSizeSelect}
            onCustomizationChange={handleCustomizationChange}
            photoUploadStepRef={photoUploadStepRef}
          />
          
          <ProductTestimonials />
        </div>

        {/* Unified Social Momentum Widget - Only show when user reaches styles section */}
        <UnifiedSocialMomentumWidget
          currentStep={currentStep}
          uploadedImage={uploadedImage}
          showWidget={currentStep === 1 && !!uploadedImage && !!selectedStyle}
        />
        
        {/* Premium Horizontal Bottom Momentum Popup - Show from step 2 onwards */}
        <BottomMomentumPopup
          currentStep={currentStep}
          completedSteps={completedSteps}
          totalSteps={4}
          selectedSize={selectedSize}
          selectedOrientation={selectedOrientation}
          customizations={customizations}
          selectedStyle={selectedStyle}
          uploadedImage={uploadedImage}
        />
      </ProgressOrchestrator>

      <Footer />
    </div>
  );
};

export default Product;

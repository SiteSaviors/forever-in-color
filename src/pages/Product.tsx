import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductHeader from "@/components/product/ProductHeader";
import ProductContent from "@/components/product/ProductContent";
import TrustElements from "@/components/product/TrustElements";
import BottomMomentumPopup from "@/components/product/components/BottomMomentumPopup";
import ProductTestimonials from "@/components/product/ProductTestimonials";
import { useProductState } from "@/components/product/ProductStateManager";
import { ProgressOrchestrator } from "@/components/product/progress/ProgressOrchestrator";

const Product = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <ProgressOrchestrator>
        <div className="pt-16">
          <ProductHeader 
            completedSteps={completedSteps}
            totalSteps={4}
            currentStep={currentStep}
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
          />
          
          <ProductTestimonials />
        </div>

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
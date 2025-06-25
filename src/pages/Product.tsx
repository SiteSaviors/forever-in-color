
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductHeader from "@/components/product/ProductHeader";
import ProductContent from "@/components/product/ProductContent";
import TrustElements from "@/components/product/TrustElements";
import PriceCalculator from "@/components/product/PriceCalculator";
import ProductTestimonials from "@/components/product/ProductTestimonials";
import { useProductState } from "@/components/product/ProductStateManager";

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
    <div className="min-h-screen bg-gray-50 w-full">
      <Header />
      
      <div className="pt-16 w-full">
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

      <PriceCalculator
        selectedSize={selectedSize}
        selectedOrientation={selectedOrientation}
        customizations={customizations}
        completedSteps={completedSteps}
        totalSteps={4}
      />

      <Footer />
    </div>
  );
};

export default Product;

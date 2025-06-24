
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductHeader from "@/components/product/ProductHeader";
import ProductContent from "@/components/product/ProductContent";
import TrustElements from "@/components/product/TrustElements";
import PriceCalculator from "@/components/product/PriceCalculator";
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
    previewUrls,
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
      
      <div className="pt-16">
        <ProductHeader 
          completedSteps={completedSteps}
          totalSteps={4}
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
          previewUrls={previewUrls}
          autoGenerationComplete={autoGenerationComplete}
          onCurrentStepChange={setCurrentStep}
          onPhotoAndStyleComplete={handlePhotoAndStyleComplete}
          onOrientationSelect={handleOrientationSelect}
          onSizeSelect={handleSizeSelect}
          onCustomizationChange={handleCustomizationChange}
        />
        
        {/* Add Testimonials Section */}
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

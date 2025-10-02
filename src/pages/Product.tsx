import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductHeader from "@/components/product/ProductHeader";
import ProductContent from "@/components/product/ProductContent";
import BottomMomentumPopup from "@/components/product/components/BottomMomentumPopup";
import ProductTestimonials from "@/components/product/ProductTestimonials";
import UnifiedSocialMomentumWidget from "@/components/product/components/UnifiedSocialMomentumWidget";
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
    preview,
    startPreview,
    cancelPreview,
    isGenerating,
    generationErrors,
    setCurrentStep,
    handlePhotoAndStyleComplete,
    handleSizeSelect,
    handleOrientationSelect,
    handleCustomizationChange
  } = useProductState();

  const handleUploadClick = () => {
    // Scroll to upload section and ensure we're on step 1
    setCurrentStep(1);
    setTimeout(() => {
      const uploadSection = document.querySelector('[data-step="1"]');
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-16">
        <ProductHeader
          completedSteps={completedSteps}
          totalSteps={4}
          currentStep={currentStep}
          onUploadClick={handleUploadClick}
        />

        <ProductContent
          currentStep={currentStep}
          completedSteps={completedSteps}
          selectedStyle={selectedStyle}
          selectedSize={selectedSize}
          selectedOrientation={selectedOrientation}
          customizations={customizations}
          uploadedImage={uploadedImage}
          autoGenerationComplete={autoGenerationComplete}
          preview={preview}
          startPreview={startPreview}
          cancelPreview={cancelPreview}
          isGenerating={isGenerating}
          generationErrors={generationErrors}
          onCurrentStepChange={setCurrentStep}
          onPhotoAndStyleComplete={handlePhotoAndStyleComplete}
          onOrientationSelect={handleOrientationSelect}
          onSizeSelect={handleSizeSelect}
          onCustomizationChange={handleCustomizationChange}
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

      <Footer />
    </div>
  );
};

export default Product;


import StreamlinedProgress from "./components/StreamlinedProgress";
import ProductHeaderBackground from "./components/ProductHeaderBackground";
import ProductHeaderSocialProof from "./components/ProductHeaderSocialProof";
import ProductHeaderHero from "./components/ProductHeaderHero";
import ProductHeaderCTA from "./components/ProductHeaderCTA";
import ProductHeaderTrustIndicators from "./components/ProductHeaderTrustIndicators";
import ProductHeaderScrollIndicator from "./components/ProductHeaderScrollIndicator";
import ProductHeaderStyles from "./components/ProductHeaderStyles";

interface ProductHeaderProps {
  completedSteps: number[];
  totalSteps: number;
  currentStep?: number;
  onUploadClick?: () => void;
}

const ProductHeader = ({
  completedSteps,
  totalSteps,
  currentStep = 1,
  onUploadClick
}: ProductHeaderProps) => {
  const progressPercentage = completedSteps.length / totalSteps * 100;

  return (
    <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-b border-purple-100 overflow-hidden">
      {/* Dynamic Background Elements */}
      <ProductHeaderBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Live Social Proof - Single Powerful Element */}
        <ProductHeaderSocialProof />

        {/* Revolutionary Headline Section */}
        <ProductHeaderHero />

        {/* Mega CTA Section - The Conversion Powerhouse */}
        <ProductHeaderCTA onUploadClick={onUploadClick} />

        {/* Streamlined Progress - Only show when needed */}
        {progressPercentage > 0 && <StreamlinedProgress currentStep={currentStep} completedSteps={completedSteps} totalSteps={totalSteps} />}

        {/* Premium Trust Indicators - Redesigned */}
        <ProductHeaderTrustIndicators />

        {/* Scroll Indicator - Conversion Critical */}
        <ProductHeaderScrollIndicator />
      </div>

      {/* Custom CSS for advanced animations */}
      <ProductHeaderStyles />
    </div>
  );
};

export default ProductHeader;

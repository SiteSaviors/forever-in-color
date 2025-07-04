
import { useDownloadPurchases } from "@/hooks/useDownloadPurchases";
import StyleCardPills from './StyleCardPills';
import StyleCardHeader from './StyleCardHeader';
import StyleCardButtons from './StyleCardButtons';

interface StyleCardInfoProps {
  style: {
    id: number;
    name: string;
    description: string;
  };
  hasGeneratedPreview: boolean;
  isPopular: boolean;
  isSelected: boolean;
  showGeneratedBadge: boolean;
  showContinueInCard: boolean;
  shouldBlur: boolean;
  showError: boolean;
  onContinueClick: (e: React.MouseEvent) => void;
  onGenerateClick: (e: React.MouseEvent) => void;
  onRetryClick: (e: React.MouseEvent) => void;
  imageUrl?: string;
  isHorizontalOrientation?: boolean;
}

const StyleCardInfo = ({
  style,
  hasGeneratedPreview,
  isPopular,
  isSelected,
  showGeneratedBadge,
  showContinueInCard,
  shouldBlur,
  showError,
  onContinueClick,
  onGenerateClick,
  onRetryClick,
  imageUrl,
  isHorizontalOrientation = false
}: StyleCardInfoProps) => {
  const { getPurchaseForStyleAndImage, redownloadPurchase } = useDownloadPurchases();

  // Check if user has already purchased this style/image combination
  const existingPurchase = imageUrl && hasGeneratedPreview ? 
    getPurchaseForStyleAndImage(style.id, imageUrl) : null;

  const handleRedownload = async () => {
    if (existingPurchase) {
      const fileName = `${style.name.replace(/\s+/g, '_')}_${existingPurchase.resolution_tier}.png`;
      await redownloadPurchase(existingPurchase.id, fileName);
    }
  };

  // Get orientation-specific spacing
  const getOrientationSpacing = () => {
    if (isHorizontalOrientation) {
      return "space-y-1.5"; // Tighter spacing for horizontal orientation
    }
    return "space-y-2"; // Standard spacing
  };

  return (
    <div className={getOrientationSpacing()}>
      <StyleCardPills 
        styleId={style.id} 
        isHorizontalOrientation={isHorizontalOrientation} 
      />

      <StyleCardHeader
        style={style}
        isPopular={isPopular}
        showGeneratedBadge={showGeneratedBadge}
        existingPurchase={existingPurchase}
        isHorizontalOrientation={isHorizontalOrientation}
      />

      <StyleCardButtons
        style={style}
        hasGeneratedPreview={hasGeneratedPreview}
        isSelected={isSelected}
        showError={showError}
        onContinueClick={onContinueClick}
        onGenerateClick={onGenerateClick}
        onRetryClick={onRetryClick}
        imageUrl={imageUrl}
        existingPurchase={existingPurchase}
        onRedownload={handleRedownload}
      />
    </div>
  );
};

export default StyleCardInfo;

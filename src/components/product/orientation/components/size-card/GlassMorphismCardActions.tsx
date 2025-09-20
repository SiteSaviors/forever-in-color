
import ContinueButton from "./ContinueButton";

interface GlassMorphismCardActionsProps {
  size: string;
  isSelected: boolean;
  onContinue: (e: React.MouseEvent) => void;
}

const GlassMorphismCardActions = ({
  size,
  isSelected,
  onContinue
}: GlassMorphismCardActionsProps) => {
  return (
    <div className={`
      transition-all duration-500 transform
      ${isSelected ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
    `}>
      <ContinueButton 
        size={size}
        isSelected={isSelected}
        onContinue={onContinue}
      />
    </div>
  );
};

export default GlassMorphismCardActions;

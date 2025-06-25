
interface StyleCardActionsProps {
  style: {
    id: number;
    name: string;
    description: string;
    image: string;
  };
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

const StyleCardActions = ({
  style,
  onStyleClick,
  onContinue
}: StyleCardActionsProps) => {
  const handleClick = () => {
    console.log(`StyleCard ${style.name} clicked`);
    onStyleClick(style);
  };

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContinue) {
      console.log(`Continue clicked for ${style.name}`);
      onContinue();
    }
  };

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Generate clicked for ${style.name}`);
    // Trigger the style click which will generate the preview
    onStyleClick(style);
  };

  return {
    handleClick,
    handleContinueClick,
    handleGenerateClick
  };
};

export default StyleCardActions;

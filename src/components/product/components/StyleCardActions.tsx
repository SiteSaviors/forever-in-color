
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StyleCardActionsProps {
  style: {
    id: number;
    name: string;
  };
  onStyleClick: (style: { id: number; name: string; description: string; image: string }) => void;
  onContinue?: () => void;
}

/**
 * StyleCardActions Component
 * 
 * Centralized action handlers for StyleCard interactions.
 * Provides consistent event handling and logging across all style cards.
 * 
 * Design Philosophy:
 * - Single responsibility: handle user actions only
 * - Consistent logging for debugging and analytics
 * - Reusable across different StyleCard implementations
 */
const StyleCardActions = ({
  style,
  onStyleClick,
  onContinue
}: StyleCardActionsProps) => {

  /**
   * Handle style selection click
   * Logs interaction and delegates to parent handler
   */
  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`🎨 Generate clicked for style: ${style.name} (ID: ${style.id})`);
    
    // For generate clicks, we trigger style selection which may auto-generate
    onStyleClick({
      id: style.id,
      name: style.name,
      description: '', // Will be filled by parent
      image: '' // Will be filled by parent
    });
  };

  /**
   * Handle continue button click
   * Proceeds to next step after style selection
   */
  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`➡️ Continue clicked for style: ${style.name} (ID: ${style.id})`);
    
    if (onContinue) {
      onContinue();
    }
  };

  return {
    handleGenerateClick,
    handleContinueClick
  };
};

export default StyleCardActions;

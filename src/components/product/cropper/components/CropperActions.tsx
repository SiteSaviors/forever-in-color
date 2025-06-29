
import { memo } from "react";
import { Button } from "@/components/ui/button";

interface CropperActionsProps {
  onCancel: () => void;
  onApply: () => void;
  isApplying?: boolean;
}

const CropperActions = memo(({
  onCancel,
  onApply,
  isApplying = false
}: CropperActionsProps) => {
  return (
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onCancel} disabled={isApplying}>
        Cancel
      </Button>
      <Button onClick={onApply} disabled={isApplying}>
        {isApplying ? 'Applying...' : 'Apply Crop'}
      </Button>
    </div>
  );
});

CropperActions.displayName = 'CropperActions';

export default CropperActions;

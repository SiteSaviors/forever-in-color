
import { memo } from "react";

interface StepActionsProps {
  children: React.ReactNode;
}

const StepActions = memo(({ children }: StepActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-end">
      {children}
    </div>
  );
});

StepActions.displayName = 'StepActions';

export default StepActions;

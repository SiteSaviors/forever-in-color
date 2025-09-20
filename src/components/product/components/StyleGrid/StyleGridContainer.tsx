
import React from "react";

interface StyleGridContainerProps {
  children: React.ReactNode;
}

const StyleGridContainer = React.memo(({ children }: StyleGridContainerProps) => {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
});

StyleGridContainer.displayName = 'StyleGridContainer';

export default StyleGridContainer;

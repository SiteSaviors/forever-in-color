
import React from "react";
import ErrorBoundary from "../ErrorBoundary";
import { MobileTypography } from "@/components/ui/mobile-typography";

interface StepContentWrapperProps {
  children: React.ReactNode;
}

const StepContentWrapper = React.memo(({ children }: StepContentWrapperProps) => {
  return (
    <div className="bg-gradient-to-r from-gray-50/80 to-purple-50/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-8 border border-gray-100/50 shadow-inner animate-fade-in content-container-optimized">
      <ErrorBoundary fallback={
        <div className="text-center py-4">
          <MobileTypography variant="body" className="text-gray-600">
            Unable to load step content. Please refresh the page.
          </MobileTypography>
        </div>
      }>
        {children}
      </ErrorBoundary>
    </div>
  );
});

StepContentWrapper.displayName = 'StepContentWrapper';

export default StepContentWrapper;

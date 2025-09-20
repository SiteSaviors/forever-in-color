
import React from "react";
import ErrorBoundary from "../ErrorBoundary";
import { MobileTypography } from "@/components/ui/mobile-typography";

interface StepContentWrapperProps {
  children: React.ReactNode;
}

const StepContentWrapper = React.memo(({ children }: StepContentWrapperProps) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-purple-50/60 to-indigo-100/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 border border-purple-100/60 shadow-lg backdrop-blur-sm animate-fade-in content-container-optimized">
      <ErrorBoundary fallback={
        <div className="text-center py-6">
          <MobileTypography variant="body" className="text-gray-600 font-poppins">
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

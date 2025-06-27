
import React from "react";

interface SizeCardSkeletonProps {
  count?: number;
  isMobile?: boolean;
}

const SizeCardSkeleton: React.FC<SizeCardSkeletonProps> = ({ 
  count = 3, 
  isMobile = false 
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className={`
            relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden
            ${isMobile ? 'min-h-[320px] mx-2' : 'min-h-[400px]'}
            animate-pulse
          `}
          aria-label="Loading size option"
        >
          <div className={`p-4 ${isMobile ? 'md:p-6' : 'md:p-8'} space-y-4 h-full flex flex-col`}>
            
            {/* Top badges skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>

            {/* Canvas preview skeleton */}
            <div className="flex justify-center flex-1 items-center">
              <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Size information skeleton */}
            <div className="text-center space-y-2">
              <div className="h-6 w-24 bg-gray-200 rounded mx-auto"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
            </div>

            {/* Pricing skeleton */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-6 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded mx-auto"></div>
            </div>

            {/* Button skeleton */}
            <div className="mt-auto">
              <div className={`
                w-full bg-gray-200 rounded-xl
                ${isMobile ? 'h-14' : 'h-16'}
              `}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SizeCardSkeleton;

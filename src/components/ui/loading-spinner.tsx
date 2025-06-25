
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "overlay" | "card";
  message?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  variant = "default", 
  message,
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const spinnerElement = (
    <Loader2 className={cn("animate-spin", sizeClasses[size])} />
  );

  if (variant === "overlay") {
    return (
      <div className={cn(
        "absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-lg",
        className
      )}>
        <div className="text-white flex flex-col items-center space-y-2">
          {spinnerElement}
          {message && (
            <p className="text-sm font-medium">{message}</p>
          )}
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center p-6 space-y-2 text-gray-500",
        className
      )}>
        {spinnerElement}
        {message && (
          <p className="text-sm">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {spinnerElement}
      {message && (
        <span className="text-sm">{message}</span>
      )}
    </div>
  );
};


import { useState, useEffect } from "react";
import { CheckCircle, Sparkles, Zap } from "lucide-react";

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  duration?: number;
}

/**
 * SuccessAnimation Component
 * 
 * Provides delightful feedback for successful actions.
 */
export const SuccessAnimation = ({ 
  show, 
  message = "Success!", 
  duration = 2000 
}: SuccessAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

interface LoadingPulseProps {
  children: React.ReactNode;
  isLoading: boolean;
}

/**
 * LoadingPulse Component
 * 
 * Adds subtle loading animation to wrapped content.
 */
export const LoadingPulse = ({ children, isLoading }: LoadingPulseProps) => {
  return (
    <div className={`transition-all duration-300 ${isLoading ? 'animate-pulse' : ''}`}>
      {children}
    </div>
  );
};

interface FloatingActionFeedbackProps {
  show: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  message: string;
  variant?: 'success' | 'info' | 'warning';
}

/**
 * FloatingActionFeedback Component
 * 
 * Shows floating feedback for user actions.
 */
export const FloatingActionFeedback = ({ 
  show, 
  icon: Icon = Sparkles, 
  message, 
  variant = 'info' 
}: FloatingActionFeedbackProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  const variantStyles = {
    success: 'bg-green-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-amber-500 text-white'
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${variantStyles[variant]}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

interface HoverRevealProps {
  children: React.ReactNode;
  hoverContent: React.ReactNode;
  delay?: number;
}

/**
 * HoverReveal Component
 * 
 * Reveals additional content on hover with smooth animation.
 */
export const HoverReveal = ({ children, hoverContent, delay = 0 }: HoverRevealProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <div 
        className={`absolute inset-0 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ transitionDelay: isHovered ? `${delay}ms` : '0ms' }}
      >
        {hoverContent}
      </div>
    </div>
  );
};

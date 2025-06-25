
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Clock, AlertCircle } from "lucide-react";

interface SmartRetryButtonProps {
  onRetry: () => void;
  retryCount: number;
  maxRetries: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

/**
 * SmartRetryButton Component
 * 
 * Intelligent retry button that adapts behavior based on retry attempts.
 * Includes cooldown periods and progressive messaging.
 */
const SmartRetryButton = ({
  onRetry,
  retryCount,
  maxRetries,
  disabled = false,
  size = 'sm',
  variant = 'outline',
  className = ''
}: SmartRetryButtonProps) => {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isInCooldown, setIsInCooldown] = useState(false);

  // Calculate cooldown based on retry count (progressive backoff)
  const getCooldownDuration = () => {
    if (retryCount === 0) return 0;
    if (retryCount === 1) return 2;
    if (retryCount === 2) return 5;
    return 10;
  };

  // Start cooldown after retry
  useEffect(() => {
    if (retryCount > 0) {
      const duration = getCooldownDuration();
      if (duration > 0) {
        setIsInCooldown(true);
        setCooldownSeconds(duration);
        
        const interval = setInterval(() => {
          setCooldownSeconds((prev) => {
            if (prev <= 1) {
              setIsInCooldown(false);
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, [retryCount]);

  const hasReachedLimit = retryCount >= maxRetries;
  const canRetry = !disabled && !isInCooldown && !hasReachedLimit;

  const getButtonText = () => {
    if (hasReachedLimit) return "Max Retries Reached";
    if (isInCooldown) return `Wait ${cooldownSeconds}s`;
    if (retryCount === 0) return "Try Again";
    return `Retry (${retryCount}/${maxRetries})`;
  };

  const getButtonIcon = () => {
    if (hasReachedLimit) return AlertCircle;
    if (isInCooldown) return Clock;
    return RotateCcw;
  };

  const getButtonVariant = () => {
    if (hasReachedLimit) return 'ghost';
    return variant;
  };

  const ButtonIcon = getButtonIcon();

  return (
    <Button
      onClick={onRetry}
      disabled={!canRetry}
      size={size}
      variant={getButtonVariant()}
      className={`
        transition-all duration-200 min-h-[44px]
        ${hasReachedLimit ? 'text-red-500 cursor-not-allowed' : ''}
        ${isInCooldown ? 'cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <ButtonIcon className={`w-4 h-4 mr-2 ${isInCooldown ? 'animate-spin' : ''}`} />
      {getButtonText()}
    </Button>
  );
};

export default SmartRetryButton;

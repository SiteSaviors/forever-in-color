
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onGoBack?: () => void;
  fallbackComponent?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

class OrientationErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('🚨 OrientationErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Step 2 component error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Store error info for debugging
    this.setState({ errorInfo });

    // Log to external monitoring if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Step2Error: ${error.message}`,
        fatal: false
      });
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      console.warn('🚨 Max retry attempts reached for Step 2');
      return;
    }

    console.log(`🔄 Retrying Step 2 (attempt ${retryCount + 1}/${this.maxRetries})`);
    
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: retryCount + 1 
    });

    // Call optional retry handler
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  private handleGoBack = () => {
    console.log('🔙 Going back from Step 2 error state');
    
    if (this.props.onGoBack) {
      this.props.onGoBack();
    }
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      const { retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;

      return (
        <div className="space-y-4 p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <div className="font-semibold">
                  Oops! Something went wrong with the layout selection.
                </div>
                <div className="text-sm">
                  Don't worry - your progress is saved. Please try again or go back to the previous step.
                </div>
                {retryCount > 0 && (
                  <div className="text-xs text-red-600">
                    Retry attempt: {retryCount}/{this.maxRetries}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {canRetry && (
              <Button 
                onClick={this.handleRetry}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button 
              onClick={this.handleGoBack}
              variant="outline"
              size="lg"
              className="border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          {!canRetry && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="font-medium">Maximum retry attempts reached</div>
                <div className="text-sm mt-1">
                  Please go back and try again, or contact support if the issue persists.
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 p-4 bg-gray-100 rounded text-sm text-gray-700">
              <summary className="font-medium cursor-pointer mb-2">
                Error Details (Development Mode)
              </summary>
              <div className="space-y-2">
                <div>
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                {this.state.error.stack && (
                  <pre className="whitespace-pre-wrap text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                )}
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default OrientationErrorBoundary;

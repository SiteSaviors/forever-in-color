
import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  fallbackOrientation?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class AspectRatioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 Aspect Ratio Error Boundary Caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });

    // Track aspect ratio failures for optimization
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'aspect_ratio_error', {
        error_message: error.message,
        component: 'AspectRatioErrorBoundary'
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-md mx-auto">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-3">
                <p className="font-medium">Image Processing Issue</p>
                <p className="text-sm">
                  There was a problem detecting your image orientation. This sometimes happens with unusual image formats.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={this.handleRetry}
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Try Again
                  </Button>
                  {this.props.fallbackOrientation && (
                    <Button 
                      onClick={() => {
                        this.handleRetry();
                        // Use fallback orientation
                      }}
                      size="sm"
                    >
                      Use Square Format
                    </Button>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

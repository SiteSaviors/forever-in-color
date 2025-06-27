
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class SizeSelectionErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SizeSelection Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      this.props.onRetry?.();
    }
  };

  handleReset = () => {
    this.retryCount = 0;
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50 max-w-2xl mx-auto">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-red-800 font-poppins">
                Size Selection Unavailable
              </h3>
              <p className="text-red-600 font-poppins">
                We're having trouble loading the canvas size options. This might be a temporary issue.
              </p>
            </div>

            {/* Error details for debugging */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-red-100 p-4 rounded-lg border border-red-200">
                <summary className="font-semibold text-red-800 cursor-pointer">
                  Technical Details
                </summary>
                <pre className="text-xs text-red-700 mt-2 overflow-auto">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.retryCount < this.maxRetries && (
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 min-h-[44px]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again ({this.maxRetries - this.retryCount} attempts left)
                </Button>
              )}
              
              <Button 
                onClick={this.handleReset}
                className="bg-red-600 hover:bg-red-700 text-white min-h-[44px]"
              >
                <Home className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>

            <p className="text-sm text-red-500 font-poppins">
              If this problem persists, please refresh the page or contact support.
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default SizeSelectionErrorBoundary;


import React from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StepErrorBoundaryProps {
  children: React.ReactNode;
  stepNumber: number;
  onNavigateHome: () => void;
}

interface StepErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class StepErrorBoundary extends React.Component<StepErrorBoundaryProps, StepErrorBoundaryState> {
  constructor(props: StepErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): StepErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error caught and handled silently
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">
                Step {this.props.stepNumber} Error
              </h3>
              <p className="text-red-700 mb-4">
                We encountered an issue loading this step. Please try refreshing the page or return to the homepage.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  size="sm"
                >
                  Refresh Page
                </Button>
                <Button 
                  onClick={this.props.onNavigateHome}
                  variant="outline" 
                  size="sm"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default StepErrorBoundary;

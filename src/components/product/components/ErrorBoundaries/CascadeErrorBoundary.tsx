import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error context information
export interface ErrorContext {
  stepNumber?: number;
  userAction?: string;
  componentStack?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
}

// Enhanced error information
export interface EnhancedError {
  error: Error;
  severity: ErrorSeverity;
  context: ErrorContext;
  recoverable: boolean;
  fallbackComponent?: ReactNode;
}

interface Props {
  children: ReactNode;
  stepNumber?: number;
  fallbackComponent?: ReactNode;
  onError?: (errorInfo: EnhancedError) => void;
  onRetry?: () => void;
  onNavigateHome?: () => void;
  onGoBack?: () => void;
  enableAnalytics?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  enhancedError?: EnhancedError;
  retryCount: number;
  isRetrying: boolean;
  lastErrorTime: number;
}

class CascadeErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout;
  private errorAnalyticsReported = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRetrying: false,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const context: ErrorContext = {
      stepNumber: this.props.stepNumber,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      // userId could be retrieved from auth context
    };

    const severity = this.determineErrorSeverity(error, errorInfo);
    const recoverable = this.isErrorRecoverable(error, severity);

    const enhancedError: EnhancedError = {
      error,
      severity,
      context,
      recoverable,
      fallbackComponent: this.props.fallbackComponent
    };

    this.setState({
      errorInfo,
      enhancedError
    });

    // Report error for analytics
    this.reportErrorAnalytics(enhancedError);

    // Call external error handler
    this.props.onError?.(enhancedError);

    // Log detailed error information
    console.group(`🚨 CascadeErrorBoundary - Step ${this.props.stepNumber || 'Unknown'}`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Enhanced Context:', enhancedError);
    console.groupEnd();
  }

  private determineErrorSeverity(error: Error, errorInfo: React.ErrorInfo): ErrorSeverity {
    // Network/API errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'medium';
    }

    // Authentication errors
    if (error.message.includes('auth') || error.message.includes('token')) {
      return 'high';
    }

    // Payment/critical business logic errors
    if (error.message.includes('payment') || error.message.includes('stripe')) {
      return 'critical';
    }

    // UI component errors
    if (errorInfo.componentStack.includes('Button') || errorInfo.componentStack.includes('Input')) {
      return 'low';
    }

    // State management errors
    if (error.message.includes('state') || error.message.includes('dispatch')) {
      return 'high';
    }

    // Default to medium severity
    return 'medium';
  }

  private isErrorRecoverable(error: Error, severity: ErrorSeverity): boolean {
    // Critical errors are not recoverable
    if (severity === 'critical') return false;

    // Check for specific unrecoverable error patterns
    const unrecoverablePatterns = [
      'ChunkLoadError',
      'Loading chunk',
      'Importing a module script failed'
    ];

    return !unrecoverablePatterns.some(pattern => 
      error.message.includes(pattern) || error.stack?.includes(pattern)
    );
  }

  private reportErrorAnalytics(enhancedError: EnhancedError) {
    if (!this.props.enableAnalytics || this.errorAnalyticsReported) return;

    this.errorAnalyticsReported = true;

    // Report to analytics service
    try {
      // This would integrate with your analytics service
      const analyticsData = {
        event: 'error_boundary_triggered',
        properties: {
          step_number: enhancedError.context.stepNumber,
          error_message: enhancedError.error.message,
          severity: enhancedError.severity,
          recoverable: enhancedError.recoverable,
          component_stack: enhancedError.context.componentStack,
          timestamp: enhancedError.context.timestamp,
          retry_count: this.state.retryCount
        }
      };

      // Send to analytics (replace with your service)
      console.log('📊 Error Analytics:', analyticsData);
    } catch (analyticsError) {
      console.warn('Failed to report error analytics:', analyticsError);
    }
  }

  private handleRetry = async () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn('Max retry attempts reached');
      return;
    }

    this.setState({ isRetrying: true });

    // Add exponential backoff
    const delay = retryDelay * Math.pow(2, this.state.retryCount);

    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        enhancedError: undefined,
        retryCount: prevState.retryCount + 1,
        isRetrying: false
      }));

      this.props.onRetry?.();
    }, delay);
  };

  private handleNavigateHome = () => {
    this.props.onNavigateHome?.();
  };

  private handleGoBack = () => {
    this.props.onGoBack?.();
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private renderFallbackUI() {
    const { enhancedError, isRetrying, retryCount } = this.state;
    const { maxRetries = 3 } = this.props;

    if (!enhancedError) return null;

    // Use custom fallback if provided and error is recoverable
    if (enhancedError.fallbackComponent && enhancedError.recoverable) {
      return enhancedError.fallbackComponent;
    }

    const canRetry = enhancedError.recoverable && retryCount < maxRetries;
    const severityColors = {
      low: 'yellow',
      medium: 'orange',
      high: 'red',
      critical: 'red'
    };

    const color = severityColors[enhancedError.severity];

    return (
      <Card className={`border-${color}-200 bg-${color}-50 mx-4 my-8`}>
        <CardContent className="p-8 text-center">
          <AlertTriangle className={`w-16 h-16 text-${color}-500 mx-auto mb-6`} />
          
          <h3 className={`text-xl font-semibold text-${color}-800 mb-3`}>
            {enhancedError.severity === 'critical' 
              ? 'Critical Error' 
              : `Step ${this.props.stepNumber || 'Unknown'} Error`
            }
          </h3>
          
          <p className={`text-${color}-600 mb-6 max-w-md mx-auto`}>
            {enhancedError.severity === 'critical' 
              ? 'A critical error occurred. Please contact support if this continues.'
              : enhancedError.error.message || 'An unexpected error occurred while loading this step.'
            }
          </p>

          {enhancedError.severity !== 'critical' && (
            <p className={`text-${color}-500 text-sm mb-6`}>
              Error Severity: {enhancedError.severity.charAt(0).toUpperCase() + enhancedError.severity.slice(1)}
              {canRetry && ` • Attempts: ${retryCount}/${maxRetries}`}
            </p>
          )}
          
          <div className="flex gap-3 justify-center flex-wrap">
            {canRetry && (
              <Button 
                onClick={this.handleRetry}
                variant="outline"
                className={`border-${color}-300 text-${color}-700 hover:bg-${color}-100`}
                disabled={isRetrying}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
            
            {this.props.onGoBack && (
              <Button 
                onClick={this.handleGoBack}
                variant="outline"
                className={`border-${color}-300 text-${color}-700 hover:bg-${color}-100`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
            
            {this.props.onNavigateHome && (
              <Button 
                onClick={this.handleNavigateHome}
                variant="default"
                className={`bg-${color}-600 hover:bg-${color}-700`}
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            )}
          </div>

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-6 text-left">
              <summary className={`cursor-pointer text-sm text-${color}-600 mb-2`}>
                Error Details (Development)
              </summary>
              <pre className={`text-xs bg-${color}-100 p-3 rounded border overflow-auto max-h-40`}>
                {this.state.error?.stack}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          {/* Recovery suggestions */}
          {enhancedError.recoverable && (
            <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                Recovery Suggestions:
              </h4>
              <ul className="text-xs text-blue-600 text-left space-y-1">
                <li>• Check your internet connection</li>
                <li>• Refresh the page</li>
                <li>• Clear browser cache</li>
                {enhancedError.severity === 'medium' && <li>• Try again in a few moments</li>}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallbackUI();
    }

    return this.props.children;
  }
}

export default CascadeErrorBoundary;
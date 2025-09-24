import { resolvePreviewTimingConfig } from './replicate/config.ts';

const retryMetricsRegistry = new Map<string, number>();

const recordRetryMetric = (context: string, retriesUsed: number) => {
  retryMetricsRegistry.set(context, retriesUsed);
};

export const consumeRetryMetric = (context: string): number => {
  const retries = retryMetricsRegistry.get(context) ?? 0;
  retryMetricsRegistry.delete(context);
  return retries;
};

export interface ApiError {
  type: 'rate_limit' | 'service_unavailable' | 'invalid_request' | 'network_error' | 'timeout' | 'unknown';
  status: number;
  message: string;
  retryAfter?: number;
  details?: any;
}

export class EnhancedErrorHandler {
  static parseError(error: any, response?: Response): ApiError {

    // Handle network/fetch errors
    if (!response && error?.name === 'TypeError') {
      return {
        type: 'network_error',
        status: 0,
        message: 'Network connection failed',
        details: error.message
      };
    }

    // Handle timeout errors
    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
      return {
        type: 'timeout',
        status: 408,
        message: 'Request timed out',
        details: error.message
      };
    }

    if (!response) {
      return {
        type: 'unknown',
        status: 500,
        message: error?.message || 'Unknown error occurred',
        details: error
      };
    }

    const status = response.status;
    const retryAfter = response.headers.get('retry-after');

    // Parse different HTTP status codes
    switch (status) {
      case 429:
        return {
          type: 'rate_limit',
          status,
          message: 'Rate limit exceeded',
          retryAfter: retryAfter ? parseInt(retryAfter) : 60,
          details: 'Too many requests to GPT-Image-1 API'
        };

      case 503:
        return {
          type: 'service_unavailable',
          status,
          message: 'GPT-Image-1 service temporarily unavailable due to high demand',
          retryAfter: retryAfter ? parseInt(retryAfter) : 30,
          details: 'Service experiencing high load - implement retry logic'
        };

      case 400:
        return {
          type: 'invalid_request',
          status,
          message: 'Invalid request format or parameters',
          details: 'Check prompt length, image format, or aspect ratio'
        };

      case 401:
        return {
          type: 'invalid_request',
          status,
          message: 'Invalid or missing OpenAI API key',
          details: 'Verify OPENAI_API_KEY in environment variables'
        };

      case 403:
        return {
          type: 'invalid_request',
          status,
          message: 'Access denied - check API key permissions',
          details: 'API key may not have access to GPT-Image-1 model'
        };

      case 502:
      case 504:
        return {
          type: 'network_error',
          status,
          message: 'Gateway error - upstream service issue',
          retryAfter: 15,
          details: 'Temporary network issue with OpenAI servers'
        };

      default:
        return {
          type: 'unknown',
          status,
          message: `HTTP ${status} error`,
          details: `Unexpected status code from GPT-Image-1 API`
        };
    }
  }

  static shouldRetry(error: ApiError, attemptNumber: number, maxAttempts: number): boolean {
    if (attemptNumber >= maxAttempts) {
      return false;
    }

    // Retry on service unavailability, rate limits, and network errors
    return ['service_unavailable', 'rate_limit', 'network_error', 'timeout'].includes(error.type);
  }

  static getRetryDelay(error: ApiError, attemptNumber: number, baseDelayMs: number): number {
    const headerRetryAfterMs = error.retryAfter ? error.retryAfter * 1000 : undefined;
    const clampCeiling = Math.max(10000, baseDelayMs);
    const retryAfterMs = Math.min(headerRetryAfterMs ?? baseDelayMs, clampCeiling);
    const baseDelay = retryAfterMs;
    const exponentialBackoff = Math.pow(2, attemptNumber) * 1000;
    
    // Use the longer of retry-after header or exponential backoff
    return Math.max(baseDelay, exponentialBackoff);
  }

  static createUserFriendlyMessage(error: ApiError): string {
    switch (error.type) {
      case 'service_unavailable':
        return 'GPT-Image-1 is experiencing high demand. Please try again in a few moments.';
      case 'rate_limit':
        return 'Too many requests. Please wait a moment before trying again.';
      case 'invalid_request':
        return 'There was an issue with your image or request. Please try a different photo.';
      case 'network_error':
      case 'timeout':
        return 'Connection issue. Please check your internet and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: ApiError | null = null;
  const { retryAttempts, retryBaseMs } = resolvePreviewTimingConfig();
  let retriesUsed = 0;
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const result = await operation();
      recordRetryMetric(context, retriesUsed);
      return result;
    } catch (error) {
      const parsedError = EnhancedErrorHandler.parseError(error);
      lastError = parsedError;
      
      if (!EnhancedErrorHandler.shouldRetry(parsedError, attempt, retryAttempts)) {
        break;
      }

      if (attempt < retryAttempts) {
        const delay = EnhancedErrorHandler.getRetryDelay(parsedError, attempt, retryBaseMs);
        await new Promise(resolve => setTimeout(resolve, delay));
        retriesUsed++;
      }
    }
  }
  recordRetryMetric(context, retriesUsed);
  
  throw lastError;
}

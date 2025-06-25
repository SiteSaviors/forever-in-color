
export class TimeoutHandler {
  private static readonly DEFAULT_TIMEOUT = 55000; // 55 seconds (5s buffer before Supabase 60s limit)
  private static readonly HEALTH_CHECK_RESPONSE = { status: 'healthy', timestamp: new Date().toISOString() };

  /**
   * Handle request with timeout protection
   */
  static async handleWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = this.DEFAULT_TIMEOUT,
    context: string = 'Operation'
  ): Promise<T> {
    console.log(`⏱️ ${context} starting with ${timeoutMs}ms timeout`);
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`TIMEOUT: ${context} exceeded ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);
      
      console.log(`✅ ${context} completed successfully`);
      return result;
    } catch (error) {
      if (error.message?.includes('TIMEOUT')) {
        console.error(`⏰ ${context} timed out after ${timeoutMs}ms`);
        throw new Error(`Request timed out. The operation is taking longer than expected. Please try again.`);
      }
      throw error;
    }
  }

  /**
   * Handle health check requests
   */
  static handleHealthCheck(body: any): Response | null {
    if (body?.healthCheck) {
      console.log('🏥 Health check request received');
      return new Response(
        JSON.stringify(this.HEALTH_CHECK_RESPONSE),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
    return null;
  }

  /**
   * Create timeout-aware response handlers
   */
  static createTimeoutAwareHandler(corsHeaders: Record<string, string>) {
    return {
      success: (data: any, requestId: string, processingTime?: number) => {
        const response = {
          success: true,
          preview_url: data,
          request_id: requestId,
          processing_time_ms: processingTime,
          timestamp: new Date().toISOString()
        };
        
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      },

      error: (message: string, statusCode: number, requestId: string, details?: any) => {
        const response = {
          success: false,
          error: message,
          request_id: requestId,
          status_code: statusCode,
          timestamp: new Date().toISOString(),
          details
        };

        // Add retry suggestions for timeout errors
        if (message.includes('timeout') || message.includes('timed out')) {
          response.details = {
            ...details,
            retry_suggestion: 'This request took longer than expected. Please try again.',
            retry_delay_ms: 5000
          };
        }
        
        return new Response(JSON.stringify(response), {
          status: statusCode,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      },

      timeout: (requestId: string, timeoutMs: number) => {
        const response = {
          success: false,
          error: 'Request timeout',
          message: `Generation took longer than ${timeoutMs}ms. Please try again.`,
          request_id: requestId,
          status_code: 408,
          timestamp: new Date().toISOString(),
          retry_suggestion: 'Try again with a smaller image or different style',
          retry_delay_ms: 10000
        };
        
        return new Response(JSON.stringify(response), {
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    };
  }

  /**
   * Monitor request duration and log performance
   */
  static monitorPerformance(requestId: string) {
    const startTime = Date.now();
    
    return {
      end: (status: 'success' | 'error' | 'timeout') => {
        const duration = Date.now() - startTime;
        console.log(`📊 Request ${requestId} ${status} - Duration: ${duration}ms`);
        
        // Log performance warnings
        if (duration > 30000) {
          console.warn(`🐌 Slow request detected: ${requestId} took ${duration}ms`);
        }
        
        return duration;
      }
    };
  }
}

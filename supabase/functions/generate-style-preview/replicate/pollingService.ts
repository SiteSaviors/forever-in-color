
import { ReplicateGenerationResponse } from './types.ts';
import { consumeRetryMetric, EnhancedErrorHandler, executeWithRetry } from '../errorHandling.ts';
import { resolvePreviewTimingConfig } from './config.ts';

export class PollingService {
  constructor(private apiToken: string) {}

  async pollForCompletion(predictionId: string, getUrl: string): Promise<ReplicateGenerationResponse> {
    
    const { maxAttempts, pollIntervalMs, retryAttempts, retryBaseMs } = resolvePreviewTimingConfig(); // defaults: 30 attempts, 2000ms interval
    const requestId = predictionId || 'unknown-request';
    let attemptsUsed = 0;
    let retriesUsed = 0;

    console.log('[preview-poll]', {
      requestId,
      pollIntervalMs,
      maxAttempts,
      retryAttempts,
      retryBaseMs,
      attemptsUsed,
      retriesUsed,
      finalStatus: 'started'
    });

    const waitWithJitter = async () => {
      const jitter = Math.floor(Math.random() * 401) - 200; // ±200ms
      const effectiveInterval = Math.max(0, pollIntervalMs + jitter);
      await new Promise(resolve => setTimeout(resolve, effectiveInterval));
    };
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attemptsUsed = attempt;
      const contextLabel = `Polling attempt ${attempt}`;
      try {

        const result = await executeWithRetry(async () => {
          const response = await fetch(getUrl, {
            headers: {
              "Authorization": `Bearer ${this.apiToken}`,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            
            if (response.status === 503) {
              const error = new Error('Service temporarily unavailable');
              error.name = 'ServiceUnavailable';
              throw error;
            }
            
            throw new Error(`Polling failed: ${response.status} - ${errorText}`);
          }

          return await response.json();
        }, contextLabel);

        retriesUsed += consumeRetryMetric(contextLabel);



        if (result.status === 'succeeded') {
          let outputUrl = result.output;
          if (Array.isArray(outputUrl)) {
            outputUrl = outputUrl[0];
          }

          console.log('[preview-poll]', {
            requestId,
            pollIntervalMs,
            maxAttempts,
            retryAttempts,
            retryBaseMs,
            attemptsUsed,
            retriesUsed,
            finalStatus: 'succeeded'
          });
          return {
            ok: true,
            output: outputUrl
          };
        }
        
        if (result.status === 'failed') {
          const errorMsg = result.error || 'Generation failed during polling';
          console.log('[preview-poll]', {
            requestId,
            pollIntervalMs,
            maxAttempts,
            retryAttempts,
            retryBaseMs,
            attemptsUsed,
            retriesUsed,
            finalStatus: 'failed'
          });
          
          return {
            ok: false,
            error: EnhancedErrorHandler.createUserFriendlyMessage({
              type: 'service_unavailable',
              status: 500,
              message: errorMsg
            })
          };
        }

        if (result.status === 'canceled') {
          console.log('[preview-poll]', {
            requestId,
            pollIntervalMs,
            maxAttempts,
            retryAttempts,
            retryBaseMs,
            attemptsUsed,
            retriesUsed,
            finalStatus: 'canceled'
          });
          return {
            ok: false,
            error: 'Generation was canceled'
          };
        }

        // Continue polling for other statuses
        if (attempt < maxAttempts) {
          await waitWithJitter();
        }

      } catch (error) {
        retriesUsed += consumeRetryMetric(contextLabel);
        
        // If this is the last attempt, return the error
        if (attempt >= maxAttempts) {
          const parsedError = EnhancedErrorHandler.parseError(error);
          console.log('[preview-poll]', {
            requestId,
            pollIntervalMs,
            maxAttempts,
            retryAttempts,
            retryBaseMs,
            attemptsUsed,
            retriesUsed,
            finalStatus: 'error'
          });
          return {
            ok: false,
            error: EnhancedErrorHandler.createUserFriendlyMessage(parsedError)
          };
        }
        
        // Wait before next attempt
        await waitWithJitter();
      }
    }


    console.log('[preview-poll]', {
      requestId,
      pollIntervalMs,
      maxAttempts,
      retryAttempts,
      retryBaseMs,
      attemptsUsed,
      retriesUsed,
      finalStatus: 'timeout'
    });
    return {
      ok: false,
      error: 'Generation is taking longer than expected. Please try again.'
    };
  }
}

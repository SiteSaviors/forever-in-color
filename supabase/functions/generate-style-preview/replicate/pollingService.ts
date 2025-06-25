
import { ReplicateGenerationResponse } from './types.ts';
import { EnhancedErrorHandler, executeWithRetry } from '../errorHandling.ts';

export class PollingService {
  constructor(private apiToken: string) {}

  async pollForCompletion(predictionId: string, getUrl: string): Promise<ReplicateGenerationResponse> {
    console.log('=== POLLING SERVICE ===');
    console.log('Starting enhanced polling for prediction:', predictionId);
    
    const maxAttempts = 30; // 60 seconds total
    const pollInterval = 2000; // 2 seconds
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Polling attempt ${attempt}/${maxAttempts} for prediction ${predictionId}`);
        
        const result = await executeWithRetry(async () => {
          const response = await fetch(getUrl, {
            headers: {
              "Authorization": `Bearer ${this.apiToken}`,
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Polling failed with status ${response.status}:`, errorText);
            
            if (response.status === 503) {
              const error = new Error('Service temporarily unavailable');
              error.name = 'ServiceUnavailable';
              throw error;
            }
            
            throw new Error(`Polling failed: ${response.status} - ${errorText}`);
          }

          return await response.json();
        }, `Polling attempt ${attempt}`);

        console.log(`Poll attempt ${attempt} status:`, result.status);

        if (result.status === 'succeeded') {
          let outputUrl = result.output;
          if (Array.isArray(outputUrl)) {
            outputUrl = outputUrl[0];
          }
          
          console.log('GPT-Image-1 polling completed successfully:', outputUrl);
          return {
            ok: true,
            output: outputUrl
          };
        }
        
        if (result.status === 'failed') {
          const errorMsg = result.error || 'Generation failed during polling';
          console.error('GPT-Image-1 failed during polling:', errorMsg);
          
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
          return {
            ok: false,
            error: 'Generation was canceled'
          };
        }

        // Continue polling for other statuses
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

      } catch (error) {
        console.error(`Polling attempt ${attempt} error:`, error);
        
        // If this is the last attempt, return the error
        if (attempt >= maxAttempts) {
          const parsedError = EnhancedErrorHandler.parseError(error);
          return {
            ok: false,
            error: EnhancedErrorHandler.createUserFriendlyMessage(parsedError)
          };
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    console.log('Polling timed out after', maxAttempts, 'attempts');
    return {
      ok: false,
      error: 'Generation is taking longer than expected. Please try again.'
    };
  }
}

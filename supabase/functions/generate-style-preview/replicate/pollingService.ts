
import { REPLICATE_CONFIG } from './config.ts';
import { ReplicateGenerationResponse } from './types.ts';

export class PollingService {
  constructor(private apiToken: string) {}

  async pollForCompletion(predictionId: string, pollUrl: string): Promise<ReplicateGenerationResponse> {
    if (!pollUrl) {
      return {
        ok: false,
        error: "No poll URL provided"
      };
    }

    console.log('Polling for completion:', predictionId);
    
    let attempts = 0;

    while (attempts < REPLICATE_CONFIG.maxPollAttempts) {
      try {
        const response = await fetch(pollUrl, {
          headers: {
            "Authorization": `Bearer ${this.apiToken}`,
          },
        });

        if (!response.ok) {
          console.error('Polling failed:', response.status);
          return {
            ok: false,
            error: `Polling failed: ${response.status}`
          };
        }

        const result = await response.json();
        console.log(`Poll attempt ${attempts + 1}, status:`, result.status);

        if (result.status === "succeeded") {
          console.log('Generation succeeded:', result.output);
          return {
            ok: true,
            output: result.output
          };
        } else if (result.status === "failed") {
          console.error('Generation failed:', result.error);
          return {
            ok: false,
            error: result.error || "Image generation failed"
          };
        } else if (result.status === "canceled") {
          return {
            ok: false,
            error: "Generation was canceled"
          };
        }

        await new Promise(resolve => setTimeout(resolve, REPLICATE_CONFIG.pollIntervalMs));
        attempts++;
      } catch (error) {
        console.error('Polling error:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, REPLICATE_CONFIG.pollIntervalMs));
      }
    }

    return {
      ok: false,
      error: `Generation timed out after ${REPLICATE_CONFIG.timeoutMinutes} minute`
    };
  }
}

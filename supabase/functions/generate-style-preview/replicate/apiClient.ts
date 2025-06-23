
import { REPLICATE_CONFIG } from './config.ts';
import { ReplicateGenerationRequest, ReplicateGenerationResponse } from './types.ts';

export class ReplicateApiClient {
  constructor(private apiToken: string) {}

  async createPrediction(requestBody: ReplicateGenerationRequest): Promise<ReplicateGenerationResponse> {
    try {
      const response = await fetch(`${REPLICATE_CONFIG.baseUrl}/models/${REPLICATE_CONFIG.model}/predictions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Replicate API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Replicate API error details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        return {
          ok: false,
          error: `API request failed: ${response.status} - ${errorData}`
        };
      }

      const data = await response.json();
      console.log('Generation completed:', data);

      return {
        ok: true,
        ...data
      };
    } catch (error) {
      console.error('API client error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }

  async getPredictionStatus(predictionId: string): Promise<ReplicateGenerationResponse> {
    try {
      const response = await fetch(`${REPLICATE_CONFIG.baseUrl}/predictions/${predictionId}`, {
        headers: {
          "Authorization": `Token ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        return {
          ok: false,
          error: `Status check failed: ${response.status}`
        };
      }

      const result = await response.json();
      return {
        ok: true,
        ...result
      };
    } catch (error) {
      console.error('Error getting prediction status:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }
}

import { REPLICATE_CONFIG } from './config.ts';
import { ReplicateGenerationRequest, ReplicateGenerationResponse } from './types.ts';

export class ReplicateApiClient {
  constructor(private apiToken: string) {}

  async createPrediction(requestBody: ReplicateGenerationRequest): Promise<ReplicateGenerationResponse> {
    try {
      console.log('=== REPLICATE API CLIENT ===');
      console.log('Creating prediction with request body:', JSON.stringify({
        ...requestBody,
        input: {
          ...requestBody.input,
          // Don't log the full image data
          image: requestBody.input?.image ? '[IMAGE_DATA]' : undefined
        }
      }, null, 2));
      
      const response = await fetch(`${REPLICATE_CONFIG.baseUrl}/predictions`, {
        method: "POST",
        headers: {
          "Authorization": `Token ${this.apiToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          version: REPLICATE_CONFIG.model,
          input: requestBody.input
        })
      });

      console.log('Replicate API response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }
        
        console.error('Replicate API error details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        return {
          ok: false,
          error: `API request failed: ${response.status} - ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`
        };
      }

      const data = await response.json();
      console.log('Replicate response:', {
        id: data.id,
        status: data.status,
        urls: data.urls
      });
      
      // For Replicate, we need to poll for the result
      return {
        ok: true,
        id: data.id,
        status: data.status || 'processing',
        urls: data.urls
      };
    } catch (error) {
      console.error('Replicate API client error:', error);
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
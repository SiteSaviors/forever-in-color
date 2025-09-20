
import { REPLICATE_CONFIG } from './config.ts';
import { ReplicateGenerationRequest, ReplicateGenerationResponse } from './types.ts';

export class ReplicateApiClient {
  constructor(private apiToken: string) {}

  async createPrediction(requestBody: ReplicateGenerationRequest): Promise<ReplicateGenerationResponse> {
    try {
      // Log the complete request for debugging
      console.log(`🔧 [DEBUG] Replicate API Request:`, {
        url: `${REPLICATE_CONFIG.baseUrl}/models/${REPLICATE_CONFIG.model}/predictions`,
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken.substring(0, 10)}...`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify(requestBody, null, 2)
      });
      
      const response = await fetch(`${REPLICATE_CONFIG.baseUrl}/models/${REPLICATE_CONFIG.model}/predictions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify(requestBody),
      });

      // Log response details
      console.log(`🔧 [DEBUG] Replicate API Response Status: ${response.status} ${response.statusText}`);
      console.log(`🔧 [DEBUG] Replicate API Response Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error(`🔧 [DEBUG] Replicate API Error Response:`, errorData);
        
        // Try to parse error as JSON for more details
        let parsedError;
        try {
          parsedError = JSON.parse(errorData);
          console.error(`🔧 [DEBUG] Parsed Error Details:`, parsedError);
        } catch {
          console.error(`🔧 [DEBUG] Raw Error Text:`, errorData);
        }
        
        return {
          ok: false,
          error: `GPT-Image-1 API request failed: ${response.status} - ${errorData}`,
          technicalError: errorData,
          statusCode: response.status
        };
      }

      const data = await response.json();
      console.log(`🔧 [DEBUG] Replicate API Success Response:`, JSON.stringify(data, null, 2));

      return {
        ok: true,
        ...data
      };
    } catch (error) {
      console.error(`🔧 [DEBUG] Replicate API Exception:`, error);
      return {
        ok: false,
        error: error.message,
        technicalError: error.stack
      };
    }
  }

  async getPredictionStatus(predictionId: string): Promise<ReplicateGenerationResponse> {
    try {
      console.log(`🔧 [DEBUG] Checking prediction status: ${predictionId}`);
      
      const response = await fetch(`${REPLICATE_CONFIG.baseUrl}/predictions/${predictionId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
      });

      console.log(`🔧 [DEBUG] Status check response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`🔧 [DEBUG] Status check error:`, errorData);
        return {
          ok: false,
          error: `GPT-Image-1 status check failed: ${response.status} - ${errorData}`
        };
      }

      const result = await response.json();
      console.log(`🔧 [DEBUG] Status check result:`, JSON.stringify(result, null, 2));
      return {
        ok: true,
        ...result
      };
    } catch (error) {
      console.error(`🔧 [DEBUG] Status check exception:`, error);
      return {
        ok: false,
        error: error.message
      };
    }
  }
}

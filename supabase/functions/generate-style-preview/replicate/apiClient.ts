
import { REPLICATE_CONFIG } from './config.ts';
import { ReplicateGenerationRequest, ReplicateGenerationResponse } from './types.ts';

export class ReplicateApiClient {
  constructor(private apiToken: string) {}

  async createPrediction(
    requestBody: ReplicateGenerationRequest,
    modelOverride?: string
  ): Promise<ReplicateGenerationResponse> {
    try {
      const model = modelOverride ?? REPLICATE_CONFIG.model;
      const endpoint = `${REPLICATE_CONFIG.baseUrl}/models/${model}/predictions`;

      console.log(`🔧 [DEBUG] Replicate API Request:`, {
        url: endpoint,
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken.substring(0, 10)}...`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify(requestBody, null, 2)
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`🔧 [DEBUG] Replicate API Response Status: ${response.status} ${response.statusText}`);
      console.log(`🔧 [DEBUG] Replicate API Response Headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`🔧 [DEBUG] Replicate API Error Response:`, errorData);

        let parsedError;
        try {
          parsedError = JSON.parse(errorData);
          console.error(`🔧 [DEBUG] Parsed Error Details:`, parsedError);
        } catch {
          console.error(`🔧 [DEBUG] Raw Error Text:`, errorData);
        }

        return {
          ok: false,
          error: `${model} API request failed: ${response.status} - ${errorData}`,
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
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      return {
        ok: false,
        error: message,
        technicalError: stack
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
          error: `prediction status check failed: ${response.status} - ${errorData}`
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
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        error: message
      };
    }
  }
}

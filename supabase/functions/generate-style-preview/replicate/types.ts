export interface ReplicateGenerationRequest {
  input: {
    prompt: string;
    image: string;
    strength?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
  };
}

export interface ReplicateGenerationResponse {
  ok: boolean;
  output?: string | string[];
  error?: string;
  status?: string;
  id?: string;
  urls?: {
    get?: string;
  };
}

export interface ReplicatePredictionStatus {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
}
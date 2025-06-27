export interface ReplicateGenerationRequest {
  input: {
    prompt: string;
    image: string;
    strength?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
    negative_prompt?: string;
  };
}

export interface ReplicateGenerationResponse {
  ok: boolean;
  output?: string | string[];
  error?: string;
  errorType?: string;
  technicalError?: string;
  status?: string;
  id?: string;
  urls?: {
    get?: string;
    cancel?: string;
  };
}

export interface ReplicatePredictionStatus {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
}
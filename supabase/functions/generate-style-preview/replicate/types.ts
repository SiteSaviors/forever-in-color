
export interface ReplicateGenerationRequest {
  input: {
    prompt: string;
    input_image: string;
    output_format: string;
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

import { corsHeaders } from './corsUtils.ts';
import { logSecurityEvent } from './securityLogger.ts';

export interface EnvironmentValidationResult {
  isValid: boolean;
  replicateApiToken?: string;
  openaiApiKey?: string | null;
  error?: Response;
}

export async function validateEnvironment(req: Request, requestId: string): Promise<EnvironmentValidationResult> {
  const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
  const openAiApiKey = Deno.env.get('OPENAI_API_KEY') ?? Deno.env.get('OPEN_AI_KEY') ?? '';

  if (!replicateApiToken || replicateApiToken.trim() === '') {
    try {
      await logSecurityEvent('api_key_missing', 'Replicate API token not configured or empty', req);
    } catch (_logError) {
      // Best effort logging; never block request flow
    }

    return {
      isValid: false,
      error: new Response(
        JSON.stringify({
          error: 'Service configuration error',
          message: 'Image processing service is not properly configured. Please contact support.',
          requestId,
          timestamp: new Date().toISOString()
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    };
  }

  const sanitizedReplicateToken = replicateApiToken.trim();
  const sanitizedOpenAiKey = openAiApiKey.trim();

  if (!sanitizedOpenAiKey) {
    console.warn('[env-validator] GPT-Image-1 fallback disabled: OPENAI_API_KEY not set');
  }

  return {
    isValid: true,
    replicateApiToken: sanitizedReplicateToken,
    openaiApiKey: sanitizedOpenAiKey || null
  };
}

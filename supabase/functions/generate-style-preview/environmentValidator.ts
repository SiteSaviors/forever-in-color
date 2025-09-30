import { corsHeaders } from './corsUtils.ts';
import { logSecurityEvent } from './securityLogger.ts';

export interface EnvironmentValidationResult {
  isValid: boolean;
  openaiApiKey?: string;
  replicateApiToken?: string;
  error?: Response;
}

export async function validateEnvironment(req: Request, requestId: string): Promise<EnvironmentValidationResult> {
  // Enhanced environment variable validation with better error messages
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY');
  const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');

  // Check for missing or empty OpenAI API key
  if (!openaiApiKey || openaiApiKey.trim() === '') {
    const errorMsg = 'OpenAI API key is not configured or is empty. Please set OPENAI_API_KEY or OPEN_AI_KEY environment variable in your Supabase project settings.';

    try {
      await logSecurityEvent('api_key_missing', errorMsg, req);
    } catch (logError) {
      console.error('Failed to log missing OpenAI API key event', logError);
    }
    
    return {
      isValid: false,
      error: new Response(
        JSON.stringify({ 
          error: 'Service configuration error',
          message: errorMsg,
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

  // Check for missing or empty Replicate API token
  if (!replicateApiToken || replicateApiToken.trim() === '') {
    const errorMsg = 'Replicate API token is not configured or is empty. Please set REPLICATE_API_TOKEN environment variable in your Supabase project settings.';

    try {
      await logSecurityEvent('api_key_missing', errorMsg, req);
    } catch (logError) {
      console.error('Failed to log missing Replicate API token event', logError);
    }
    
    return {
      isValid: false,
      error: new Response(
        JSON.stringify({ 
          error: 'Service configuration error',
          message: errorMsg,
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

  return {
    isValid: true,
    openaiApiKey: openaiApiKey.trim(),
    replicateApiToken: replicateApiToken.trim()
  };
}

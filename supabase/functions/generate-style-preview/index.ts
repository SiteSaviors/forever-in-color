import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { StylePromptService } from './stylePromptService.ts';
import { corsHeaders, handleCorsPreflightRequest, createCorsResponse } from './corsUtils.ts';
import { validateRequest } from './requestValidator.ts';
import { ReplicateService } from './replicateService.ts';
import { createSuccessResponse, createErrorResponse } from './responseUtils.ts';
import { getPromptCacheConfig, getCachedPrompt, setCachedPrompt, schedulePromptWarmup } from './promptCache.ts';

async function normalizeImageInput(image: string): Promise<string> {
  if (image.startsWith('data:image/')) {
    return image;
  }

  try {
    const response = await fetch(image);
    if (!response.ok) {
      throw new Error(`Image fetch failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const buffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Failed to normalize image input:', error);
    return image; // fall back to original to preserve previous behavior
  }
}

function buildFallbackPrompt(style: string): string {
  return `Transform this image into ${style} style while keeping the exact same subject, composition, and scene. Apply only the artistic style transformation. Do not change what is depicted in the image - only change how it looks artistically.`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createCorsResponse(
      JSON.stringify(createErrorResponse('method_not_allowed', 'Method not allowed')), 
      405
    );
  }

  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const body = await req.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.isValid) {
      return createCorsResponse(
        JSON.stringify(createErrorResponse('invalid_request', validation.error!)),
        400
      );
    }

    const { imageUrl, style, aspectRatio, quality } = validation.data!;

    const normalizedImageUrl = await normalizeImageInput(imageUrl);

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');
    
    if (!openaiApiKey || !replicateApiToken) {
      return createCorsResponse(
        JSON.stringify(createErrorResponse('configuration_error', 'AI service configuration error')),
        500
      );
    }

    // Initialize Supabase client and StylePromptService
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stylePromptService = new StylePromptService(supabase);

    const promptCacheConfig = getPromptCacheConfig();
    if (promptCacheConfig.enabled) {
      schedulePromptWarmup((styleName) => stylePromptService.getStylePrompt(styleName));
    }

    let stylePrompt: string;
    const cacheEntry = getCachedPrompt(style);
    const promptCacheWasHit = !!cacheEntry;

    if (cacheEntry) {
      stylePrompt = cacheEntry.prompt;
      console.log('[prompt-cache]', {
        action: 'hit',
        style,
        requestId,
        source: cacheEntry.source,
        ageMs: cacheEntry.ageMs,
      });
    } else {
      const promptFetchStart = Date.now();
      let fetchedPrompt: string | null = null;

      try {
        fetchedPrompt = await stylePromptService.getStylePrompt(style);
      } catch (error) {
        console.error('[prompt-cache]', {
          action: 'fetch_error',
          style,
          requestId,
          message: error instanceof Error ? error.message : String(error),
        });
      }

      const promptFetchDurationMs = Date.now() - promptFetchStart;

      if (fetchedPrompt) {
        stylePrompt = fetchedPrompt;
        setCachedPrompt(style, stylePrompt, 'db');
      } else {
        stylePrompt = buildFallbackPrompt(style);
        setCachedPrompt(style, stylePrompt, 'fallback');
      }

      console.log('[prompt-cache]', {
        action: 'miss',
        style,
        requestId,
        fetchDurationMs: promptFetchDurationMs,
        source: fetchedPrompt ? 'db' : 'fallback',
      });
    }

    // Initialize Replicate service
    console.log(`🔧 [DIAGNOSTIC] Initializing Replicate service for request [${requestId}]`);
    console.log(`🔧 [DIAGNOSTIC] API Keys present - OpenAI: ${!!openaiApiKey}, Replicate: ${!!replicateApiToken}`);
    console.log(`🔧 [DIAGNOSTIC] Style prompt: "${stylePrompt}"`);
    console.log(`🔧 [DIAGNOSTIC] Aspect ratio: ${aspectRatio}, Quality: ${quality}`);
    
    const replicateService = new ReplicateService(replicateApiToken, openaiApiKey);
    const replicateStart = Date.now();

    // Generate image using Replicate's openai/gpt-image-1 model
    console.log(`🔧 [DIAGNOSTIC] Attempting image generation with Replicate...`);
    const result = await replicateService.generateImageToImage(normalizedImageUrl, stylePrompt, aspectRatio, quality);
    const replicateDurationMs = Date.now() - replicateStart;

    if (result.ok && result.output) {
      console.log(`🔧 [DIAGNOSTIC] Image generation result: SUCCESS`);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('[preview-metrics]', {
        requestId,
        style,
        action: 'replicate_success',
        replicateDurationMs,
        totalDurationMs: duration,
        promptCacheHit: promptCacheWasHit,
      });

      return createCorsResponse(
        JSON.stringify(createSuccessResponse(result.output, requestId, duration))
      );
    }

    // Generation failed
    console.error(`🔧 [DIAGNOSTIC] Replicate generation failed for request [${requestId}]:`, result.error);
    console.error('[preview-metrics]', {
      requestId,
      style,
      action: 'replicate_failure',
      replicateDurationMs,
      promptCacheHit: promptCacheWasHit,
      error: result.error || 'unknown_error',
    });
    return createCorsResponse(
      JSON.stringify(createErrorResponse('generation_failed', result.error || 'AI service is temporarily unavailable. Please try again.')),
      503
    );

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error('[preview-metrics]', {
      requestId,
      action: 'replicate_exception',
      totalDurationMs: duration,
      message: error instanceof Error ? error.message : String(error),
    });
    
    return createCorsResponse(
      JSON.stringify(createErrorResponse('internal_error', 'Internal server error. Please try again.', requestId)),
      500
    );
  }
});

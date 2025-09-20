import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { StylePromptService } from './stylePromptService.ts';
import { corsHeaders, handleCorsPreflightRequest, createCorsResponse } from './corsUtils.ts';
import { base64ToBlob, getImageSize } from './imageUtils.ts';
import { validateRequest } from './requestValidator.ts';
import { ReplicateService } from './replicateService.ts';
import { createSuccessResponse, createErrorResponse } from './responseUtils.ts';

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

    // Get the tested, specific prompt for this style
    let stylePrompt: string;
    try {
      const fetchedPrompt = await stylePromptService.getStylePrompt(style);
      if (fetchedPrompt) {
        stylePrompt = fetchedPrompt;
      } else {
        // Fallback to a basic prompt if database lookup fails
        stylePrompt = `Transform this image into ${style} style while keeping the exact same subject, composition, and scene. Apply only the artistic style transformation. Do not change what is depicted in the image - only change how it looks artistically.`;
      }
    } catch (error) {
      stylePrompt = `Transform this image into ${style} style while keeping the exact same subject, composition, and scene. Apply only the artistic style transformation. Do not change what is depicted in the image - only change how it looks artistically.`;
    }

    // Initialize Replicate service
    console.log(`🔧 [DIAGNOSTIC] Initializing Replicate service for request [${requestId}]`);
    console.log(`🔧 [DIAGNOSTIC] API Keys present - OpenAI: ${!!openaiApiKey}, Replicate: ${!!replicateApiToken}`);
    console.log(`🔧 [DIAGNOSTIC] Style prompt: "${stylePrompt}"`);
    console.log(`🔧 [DIAGNOSTIC] Aspect ratio: ${aspectRatio}, Quality: ${quality}`);
    
    const replicateService = new ReplicateService(replicateApiToken, openaiApiKey);

    // Generate image using Replicate's openai/gpt-image-1 model
    console.log(`🔧 [DIAGNOSTIC] Attempting image generation with Replicate...`);
    const result = await replicateService.generateImageToImage(imageUrl, stylePrompt, aspectRatio, quality);
    
    if (result.ok && result.output) {
      console.log(`🔧 [DIAGNOSTIC] Image generation result: SUCCESS`);
      const endTime = Date.now();
      const duration = endTime - startTime;

      return createCorsResponse(
        JSON.stringify(createSuccessResponse(result.output, requestId, duration))
      );
    }

    // Generation failed
    console.error(`🔧 [DIAGNOSTIC] Replicate generation failed for request [${requestId}]:`, result.error);
    return createCorsResponse(
      JSON.stringify(createErrorResponse('generation_failed', result.error || 'AI service is temporarily unavailable. Please try again.')),
      503
    );

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    return createCorsResponse(
      JSON.stringify(createErrorResponse('internal_error', 'Internal server error. Please try again.', requestId)),
      500
    );
  }
});
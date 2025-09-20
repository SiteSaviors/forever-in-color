import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { StylePromptService } from './stylePromptService.ts';
import { corsHeaders, handleCorsPreflightRequest, createCorsResponse } from './corsUtils.ts';
import { base64ToBlob, getImageSize } from './imageUtils.ts';
import { validateRequest } from './requestValidator.ts';
import { OpenAIService } from './openaiService.ts';
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
    if (!openaiApiKey) {
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

    // Convert aspect ratio to size
    const size = getImageSize(aspectRatio);

    // Convert base64 image to blob
    let imageBlob: Blob;
    try {
      imageBlob = await base64ToBlob(imageUrl);
    } catch (error) {
      return createCorsResponse(
        JSON.stringify(createErrorResponse('invalid_image', 'Invalid image format')),
        400
      );
    }

    // Initialize OpenAI service
    console.log(`🔧 [DIAGNOSTIC] Initializing OpenAI service for request [${requestId}]`);
    console.log(`🔧 [DIAGNOSTIC] API Key present: ${!!openaiApiKey}, Length: ${openaiApiKey?.length || 0}`);
    console.log(`🔧 [DIAGNOSTIC] Style prompt: "${stylePrompt}"`);
    console.log(`🔧 [DIAGNOSTIC] Image size: ${size}`);
    
    const openaiService = new OpenAIService(openaiApiKey);

    // Try GPT-Image-1 with generation (supports rectangular sizes)
    console.log(`🔧 [DIAGNOSTIC] Attempting image generation...`);
    let generatedImageUrl = await openaiService.generateStyledImage(imageUrl, stylePrompt, size, requestId);
    console.log(`🔧 [DIAGNOSTIC] Image generation result: ${generatedImageUrl ? 'SUCCESS' : 'FAILED'}`);
    
    // Fallback to variations if generation fails (square sizes only)
    if (!generatedImageUrl && size === '1024x1024') {
      console.log(`🔧 [DIAGNOSTIC] Attempting image variations fallback...`);
      generatedImageUrl = await openaiService.tryImageVariations(imageBlob, stylePrompt, size, requestId);
      console.log(`🔧 [DIAGNOSTIC] Image variations result: ${generatedImageUrl ? 'SUCCESS' : 'FAILED'}`);
    }

    if (generatedImageUrl) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      return createCorsResponse(
        JSON.stringify(createSuccessResponse(generatedImageUrl, requestId, duration))
      );
    }

    // All models failed
    console.error(`🔧 [DIAGNOSTIC] All OpenAI methods failed for request [${requestId}]`);
    return createCorsResponse(
      JSON.stringify(createErrorResponse('generation_failed', 'AI service is temporarily unavailable. Please try again.')),
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
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
  console.log(`🔥 Edge Function Request: ${req.method} ${req.url}`);
  
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
  console.log(`=== GPT-IMAGE-1 REQUEST START [${requestId}] ===`);

  try {
    const body = await req.json();
    console.log(`📝 [${requestId}] Request body:`, JSON.stringify({ ...body, imageUrl: 'BASE64_DATA_HIDDEN' }, null, 2));

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
      console.error(`❌ [${requestId}] Missing OpenAI API key`);
      return createCorsResponse(
        JSON.stringify(createErrorResponse('configuration_error', 'AI service configuration error')),
        500
      );
    }

    console.log(`🎨 [${requestId}] Starting generation with:`, { style, aspectRatio, quality });

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
        console.log(`✅ [${requestId}] Using tested prompt for style: ${style}`);
      } else {
        // Fallback to a basic prompt if database lookup fails
        stylePrompt = `Transform this image into ${style} style while keeping the exact same subject, composition, and scene. Apply only the artistic style transformation. Do not change what is depicted in the image - only change how it looks artistically.`;
        console.warn(`⚠️ [${requestId}] No prompt found for style ${style}, using fallback`);
      }
    } catch (error) {
      console.error(`❌ [${requestId}] Error fetching style prompt:`, error);
      stylePrompt = `Transform this image into ${style} style while keeping the exact same subject, composition, and scene. Apply only the artistic style transformation. Do not change what is depicted in the image - only change how it looks artistically.`;
    }

    console.log(`🎯 [${requestId}] Using prompt:`, stylePrompt.substring(0, 100) + '...');

    // Convert aspect ratio to size
    const size = getImageSize(aspectRatio);

    // Convert base64 image to blob
    let imageBlob: Blob;
    try {
      imageBlob = await base64ToBlob(imageUrl);
      console.log(`📷 [${requestId}] Image converted to blob, size:`, imageBlob.size);
    } catch (error) {
      console.error(`❌ [${requestId}] Failed to convert image:`, error);
      return createCorsResponse(
        JSON.stringify(createErrorResponse('invalid_image', 'Invalid image format')),
        400
      );
    }

    // Initialize OpenAI service
    const openaiService = new OpenAIService(openaiApiKey);

    // Try GPT-Image-1 with image variations (maintains subject better)
    let generatedImageUrl = await openaiService.tryImageVariations(imageBlob, stylePrompt, size, requestId);
    
    // Fallback to GPT-Image-1 edits
    if (!generatedImageUrl) {
      generatedImageUrl = await openaiService.tryImageEdits(imageBlob, stylePrompt, size, requestId);
    }

    if (generatedImageUrl) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`=== ✅ GENERATION COMPLETED [${requestId}] in ${duration}ms ===`);

      return createCorsResponse(
        JSON.stringify(createSuccessResponse(generatedImageUrl, requestId, duration))
      );
    }

    // All models failed
    console.error(`❌ [${requestId}] All models failed`);
    return createCorsResponse(
      JSON.stringify(createErrorResponse('generation_failed', 'AI service is temporarily unavailable. Please try again.')),
      503
    );

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(`=== ❌ GPT-IMAGE-1 ERROR [${requestId}] after ${duration}ms ===`);
    console.error('💥 Unexpected error:', error);
    console.error('📍 Error stack:', error.stack);
    
    return createCorsResponse(
      JSON.stringify(createErrorResponse('internal_error', 'Internal server error. Please try again.', requestId)),
      500
    );
  }
});
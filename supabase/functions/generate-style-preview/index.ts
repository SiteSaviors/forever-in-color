
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { OpenAIService } from './openaiService.ts';
import { CanvasWatermarkService } from './canvasWatermarkService.ts';
import { EnhancedErrorHandler } from './errorHandling.ts';
import { corsHeaders, handleCorsPreflightRequest, createErrorResponse, createSuccessResponse } from './corsUtils.ts';
import { validateEnvironment } from './environmentValidator.ts';
import { validateAndParseRequest } from './requestValidator.ts';

serve(async (req) => {
  console.log(`🔥 Edge Function Request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log(`❌ Method not allowed: ${req.method}`);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`=== GPT-IMAGE-1 REQUEST START [${requestId}] ===`);

  try {
    // Validate environment variables
    const envValidation = await validateEnvironment(req, requestId);
    if (!envValidation.isValid) {
      return envValidation.error!;
    }

    // Validate and parse request
    const requestValidation = await validateAndParseRequest(req, requestId);
    if (!requestValidation.isValid) {
      return requestValidation.error!;
    }

    const { body, imageData } = requestValidation;
    const { 
      style, 
      photoId, 
      aspectRatio = '1:1', 
      isAuthenticated,
      watermark = true,
      sessionId: providedSessionId,
      quality = 'preview'
    } = body;

    // Generate session ID if not provided
    const sessionId = providedSessionId || CanvasWatermarkService.generateSessionId();

    // Initialize Supabase (optional)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    let supabase = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    console.log(`🔧 [${requestId}] Creating OpenAI service with validated inputs`);

    // Create OpenAI service with enhanced error handling
    const openaiService = new OpenAIService(envValidation.openaiApiKey!, envValidation.replicateApiToken!, supabase);
    
    // Determine quality settings
    const isPreview = quality === 'preview';
    const imageQuality = isPreview ? 'medium' : 'high';
    
    // Generate image with comprehensive error handling
    console.log(`🎨 [${requestId}] Starting generation with aspect ratio:`, aspectRatio, 'quality:', imageQuality);
    const result = await openaiService.generateImageToImage(imageData!, style, aspectRatio, imageQuality);

    if (result.ok && result.output) {
      console.log(`✅ [${requestId}] Generation successful, applying watermarks...`);
      
      let finalOutput = result.output;
      
      // Apply watermarking if requested (default behavior)
      if (watermark) {
        try {
          console.log(`💧 [${requestId}] Applying watermarks with Canvas API...`);
          
          // Apply watermarks using the CanvasWatermarkService
          finalOutput = await CanvasWatermarkService.createWatermarkedImage(
            result.output, 
            sessionId, 
            isPreview
          );
          
          console.log(`✅ [${requestId}] Canvas watermarking completed successfully`);
          
        } catch (watermarkError) {
          console.error(`⚠️ [${requestId}] Canvas watermarking failed, using original:`, watermarkError);
          // Continue with original image if watermarking fails
          finalOutput = result.output;
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`=== ✅ GPT-IMAGE-1 COMPLETED [${requestId}] in ${duration}ms ===`);

      return createSuccessResponse(finalOutput, requestId, duration);
    } else {
      console.error(`❌ [${requestId}] Generation failed:`, result.error);
      
      // Determine appropriate status code based on error type
      let statusCode = 500;
      let userMessage = 'Image generation failed. Please try again.';
      
      if (result.errorType === 'service_unavailable') {
        statusCode = 503;
        userMessage = 'AI service is temporarily unavailable. Please try again in a few moments.';
      } else if (result.errorType === 'rate_limit') {
        statusCode = 429;
        userMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (result.errorType === 'invalid_request') {
        statusCode = 400;
        userMessage = 'Invalid request. Please check your image and try again.';
      }
      
      return new Response(
        JSON.stringify({ 
          error: result.errorType || 'generation_failed',
          message: userMessage,
          requestId,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: statusCode, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(`=== ❌ GPT-IMAGE-1 ERROR [${requestId}] after ${duration}ms ===`);
    console.error('💥 Unexpected error:', error);
    console.error('📍 Error stack:', error.stack);
    
    const parsedError = EnhancedErrorHandler.parseError(error);
    const userMessage = EnhancedErrorHandler.createUserFriendlyMessage(parsedError);
    
    return createErrorResponse(userMessage, 500, requestId);
  }
});

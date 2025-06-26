
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { OpenAIService } from './openaiService.ts';
import { CanvasWatermarkService } from './canvasWatermarkService.ts';
import { logSecurityEvent } from './securityLogger.ts';
import { validateInput, extractImageData } from './inputValidation.ts';
import { handleSuccess, handleError } from './responseHandlers.ts';
import { EnhancedErrorHandler } from './errorHandling.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log(`🔥 Edge Function Request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
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
    // Enhanced environment variable validation with better error messages
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY');
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');

    console.log('🔧 Environment check:', {
      hasOpenAIKey: !!openaiApiKey,
      hasReplicateToken: !!replicateApiToken,
      openaiKeyLength: openaiApiKey?.length || 0,
      replicateTokenLength: replicateApiToken?.length || 0,
      allEnvVars: Object.keys(Deno.env.toObject()).filter(key => 
        key.includes('OPENAI') || key.includes('REPLICATE') || key.includes('API')
      )
    });

    // Check for missing or empty OpenAI API key
    if (!openaiApiKey || openaiApiKey.trim() === '') {
      const errorMsg = 'OpenAI API key is not configured or is empty. Please set OPENAI_API_KEY or OPEN_AI_KEY environment variable in your Supabase project settings.';
      console.error(`❌ [${requestId}] ${errorMsg}`);
      
      try {
        await logSecurityEvent('api_key_missing', 'OpenAI API key not configured or empty', req);
      } catch (logError) {
        console.warn('Failed to log security event:', logError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Service configuration error',
          message: 'AI service is not properly configured. Please contact support.',
          requestId,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for missing or empty Replicate API token
    if (!replicateApiToken || replicateApiToken.trim() === '') {
      const errorMsg = 'Replicate API token is not configured or is empty. Please set REPLICATE_API_TOKEN environment variable in your Supabase project settings.';
      console.error(`❌ [${requestId}] ${errorMsg}`);
      
      try {
        await logSecurityEvent('api_key_missing', 'Replicate API token not configured or empty', req);
      } catch (logError) {
        console.warn('Failed to log security event:', logError);
      }
      
      return new Response(
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
      );
    }

    // Parse request body with enhanced error handling
    let body;
    try {
      const rawBody = await req.text();
      console.log(`📝 Raw request body length: ${rawBody.length}`);
      
      if (!rawBody || rawBody.trim() === '') {
        throw new Error('Request body is empty');
      }
      
      body = JSON.parse(rawBody);
      console.log(`📋 Parsed request body keys:`, Object.keys(body));
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse request body:`, parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          message: 'Request body must be valid JSON',
          requestId,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📋 [${requestId}] Request received:`, {
      hasImageUrl: !!body.imageUrl,
      style: body.style,
      aspectRatio: body.aspectRatio,
      isAuthenticated: body.isAuthenticated,
      watermark: body.watermark !== false // Default to true unless explicitly false
    });

    const { 
      imageUrl, 
      style, 
      photoId, 
      aspectRatio = '1:1', 
      isAuthenticated,
      watermark = true,  // New parameter for watermark control
      sessionId: providedSessionId,
      quality = 'preview' // 'preview' or 'final'
    } = body;

    // CRITICAL DEBUG: Log the exact aspect ratio received and what will be used
    console.log(`🎯 [${requestId}] ASPECT RATIO DEBUG:`, {
      receivedAspectRatio: body.aspectRatio,
      defaultedAspectRatio: aspectRatio,
      willUseForGeneration: aspectRatio
    });

    // Validate required fields with better error messages
    if (!imageUrl) {
      console.error(`❌ [${requestId}] Missing imageUrl`);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field',
          message: 'Image URL is required',
          field: 'imageUrl',
          requestId,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!style) {
      console.error(`❌ [${requestId}] Missing style`);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field',
          message: 'Art style is required',
          field: 'style',
          requestId,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate session ID if not provided
    const sessionId = providedSessionId || CanvasWatermarkService.generateSessionId();

    // Enhanced input validation
    const validationResult = validateInput(imageUrl, style, aspectRatio);
    if (!validationResult.isValid) {
      console.error(`❌ [${requestId}] Input validation failed:`, validationResult.error);
      
      try {
        await logSecurityEvent('suspicious_upload', 'Input validation failed', req, {
          reason: 'Input validation failed',
          validation_error: validationResult.error,
          received_style: style,
          requestId
        });
      } catch (logError) {
        console.warn('Failed to log security event:', logError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          message: validationResult.error,
          requestId,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase (optional)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    let supabase = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    // Extract and validate image data
    const imageData = extractImageData(imageUrl);
    if (!imageData) {
      console.error(`❌ [${requestId}] Failed to extract image data`);
      
      try {
        await logSecurityEvent('invalid_image', 'Failed to extract image data', req);
      } catch (logError) {
        console.warn('Failed to log security event:', logError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Invalid image',
          message: 'Unable to process the provided image',
          requestId,
          timestamp: new Date().toISOString()
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔧 [${requestId}] Creating OpenAI service with validated inputs`);

    // Create OpenAI service with enhanced error handling
    const openaiService = new OpenAIService(openaiApiKey, replicateApiToken, supabase);
    
    // Determine quality settings
    const isPreview = quality === 'preview';
    const imageQuality = isPreview ? 'medium' : 'high';
    
    // Generate image with comprehensive error handling
    console.log(`🎨 [${requestId}] Starting generation with aspect ratio:`, aspectRatio, 'quality:', imageQuality);
    const result = await openaiService.generateImageToImage(imageData, style, aspectRatio, imageQuality);

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

      return new Response(
        JSON.stringify({ 
          preview_url: finalOutput,
          requestId,
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
    
    try {
      await logSecurityEvent('generation_error', 'Unexpected error during generation', req, {
        error: error.message,
        stack: error.stack,
        requestId
      });
    } catch (logError) {
      console.error('Failed to log security event:', logError);
    }
    
    const parsedError = EnhancedErrorHandler.parseError(error);
    const userMessage = EnhancedErrorHandler.createUserFriendlyMessage(parsedError);
    
    return new Response(
      JSON.stringify({ 
        error: 'internal_server_error',
        message: userMessage,
        requestId,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

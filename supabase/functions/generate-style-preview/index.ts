
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { OpenAIService } from './openaiService.ts';
import { logSecurityEvent } from './securityLogger.ts';
import { validateInput, extractImageData } from './inputValidation.ts';
import { handleSuccess, handleError } from './responseHandlers.ts';
import { EnhancedErrorHandler } from './errorHandling.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`=== GPT-IMAGE-1 REQUEST START [${requestId}] ===`);

  try {
    // Enhanced environment variable validation
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY');
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');

    console.log('Environment check:', {
      hasOpenAIKey: !!openaiApiKey,
      hasReplicateToken: !!replicateApiToken,
      openaiKeyLength: openaiApiKey?.length || 0,
      replicateTokenLength: replicateApiToken?.length || 0
    });

    if (!openaiApiKey) {
      console.error(`[${requestId}] Missing OpenAI API key`);
      await logSecurityEvent('api_key_missing', 'OpenAI API key not configured', req);
      return Response.json(
        { 
          success: false, 
          error: 'Service configuration error - OpenAI key missing', 
          timestamp: new Date().toISOString(),
          requestId 
        },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!replicateApiToken) {
      console.error(`[${requestId}] Missing Replicate API token`);
      await logSecurityEvent('api_key_missing', 'Replicate API token not configured', req);
      return Response.json(
        { 
          success: false, 
          error: 'Service configuration error - Replicate token missing', 
          timestamp: new Date().toISOString(),
          requestId 
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse and validate request
    const body = await req.json();
    console.log(`[${requestId}] Request received:`, {
      hasImageUrl: !!body.imageUrl,
      style: body.style,
      aspectRatio: body.aspectRatio,
      isAuthenticated: body.isAuthenticated
    });

    const { imageUrl, style, photoId, aspectRatio = '1:1', isAuthenticated } = body;

    // Enhanced input validation
    const validationResult = validateInput(imageUrl, style, aspectRatio);
    if (!validationResult.isValid) {
      console.error(`[${requestId}] Input validation failed:`, validationResult.error);
      await logSecurityEvent('suspicious_upload', 'Input validation failed', req, {
        reason: 'Input validation failed',
        validation_error: validationResult.error,
        received_style: style,
        requestId
      });
      
      return Response.json(
        { 
          success: false, 
          error: validationResult.error,
          timestamp: new Date().toISOString(),
          requestId
        },
        { status: 400, headers: corsHeaders }
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
      console.error(`[${requestId}] Failed to extract image data`);
      await logSecurityEvent('invalid_image', 'Failed to extract image data', req);
      return Response.json(
        { 
          success: false, 
          error: 'Invalid image data', 
          timestamp: new Date().toISOString(),
          requestId 
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[${requestId}] Creating OpenAI service with validated inputs`);

    // Create OpenAI service with enhanced error handling
    const openaiService = new OpenAIService(openaiApiKey, replicateApiToken, supabase);
    
    // Generate image with comprehensive error handling
    console.log(`[${requestId}] Starting generation with aspect ratio:`, aspectRatio);
    const result = await openaiService.generateImageToImage(imageData, style, aspectRatio);

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`=== GPT-IMAGE-1 COMPLETED [${requestId}] in ${duration}ms ===`);

    if (result.ok && result.output) {
      console.log(`[${requestId}] Generation successful, output URL:`, result.output);
      return handleSuccess(result.output, corsHeaders, requestId);
    } else {
      console.error(`[${requestId}] Generation failed:`, result.error);
      
      // Determine appropriate status code based on error type
      let statusCode = 500;
      if (result.errorType === 'service_unavailable') {
        statusCode = 503;
      } else if (result.errorType === 'rate_limit') {
        statusCode = 429;
      } else if (result.errorType === 'invalid_request') {
        statusCode = 400;
      }
      
      return handleError(result.error || 'Generation failed', corsHeaders, statusCode, requestId);
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(`=== GPT-IMAGE-1 ERROR [${requestId}] after ${duration}ms ===`);
    console.error('Unexpected error:', error);
    
    await logSecurityEvent('generation_error', 'Unexpected error during generation', req, {
      error: error.message,
      stack: error.stack,
      requestId
    });
    
    const parsedError = EnhancedErrorHandler.parseError(error);
    const userMessage = EnhancedErrorHandler.createUserFriendlyMessage(parsedError);
    
    return handleError(userMessage, corsHeaders, 500, requestId);
  }
});

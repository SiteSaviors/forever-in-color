
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { OpenAIService } from './openaiService.ts';
import { CanvasWatermarkService } from './canvasWatermarkService.ts';
import { logSecurityEvent } from './securityLogger.ts';
import { validateInput, extractImageData } from './inputValidation.ts';
import { EnhancedErrorHandler } from './errorHandling.ts';
import { TimeoutHandler } from './timeoutHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const monitor = TimeoutHandler.monitorPerformance(requestId);
  const responseHandler = TimeoutHandler.createTimeoutAwareHandler(corsHeaders);
  
  console.log(`=== ENHANCED GPT-IMAGE-1 REQUEST START [${requestId}] ===`);

  try {
    // Parse request body
    const body = await req.json();
    
    // Handle health check requests
    const healthResponse = TimeoutHandler.handleHealthCheck(body);
    if (healthResponse) {
      monitor.end('success');
      return healthResponse;
    }

    // Environment validation
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY');
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');

    if (!openaiApiKey || !replicateApiToken) {
      monitor.end('error');
      await logSecurityEvent('api_key_missing', 'Missing API keys', req);
      return responseHandler.error('Service configuration error', 500, requestId);
    }

    // Extract and validate request parameters
    const { 
      imageUrl, 
      style, 
      photoId, 
      aspectRatio = '1:1', 
      isAuthenticated,
      watermark = true,
      sessionId,
      quality = 'preview' 
    } = body;

    console.log(`[${requestId}] Processing request:`, {
      hasImageUrl: !!imageUrl,
      style,
      aspectRatio,
      isAuthenticated,
      watermark,
      quality
    });

    // Input validation
    const validationResult = validateInput(imageUrl, style, aspectRatio);
    if (!validationResult.isValid) {
      monitor.end('error');
      await logSecurityEvent('input_validation_failed', validationResult.error, req);
      return responseHandler.error(validationResult.error, 400, requestId);
    }

    // Extract image data
    const imageData = extractImageData(imageUrl);
    if (!imageData) {
      monitor.end('error');
      await logSecurityEvent('invalid_image', 'Failed to extract image data', req);
      return responseHandler.error('Invalid image data', 400, requestId);
    }

    // Initialize Supabase (optional)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    let supabase = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    // Process with timeout protection
    const result = await TimeoutHandler.handleWithTimeout(async () => {
      console.log(`[${requestId}] Creating OpenAI service...`);
      const openaiService = new OpenAIService(openaiApiKey, replicateApiToken, supabase);
      
      const isPreview = quality === 'preview';
      const imageQuality = isPreview ? 'medium' : 'high';
      
      console.log(`[${requestId}] Starting generation...`);
      return await openaiService.generateImageToImage(imageData, style, aspectRatio, imageQuality);
    }, 50000, `GPT-Image-1 Generation [${requestId}]`); // 50s timeout

    // Handle generation result
    if (result.ok && result.output) {
      console.log(`[${requestId}] Generation successful, processing watermarks...`);
      
      let finalOutput = result.output;
      
      // Apply watermarking if requested
      if (watermark) {
        try {
          const watermarkSessionId = sessionId || CanvasWatermarkService.generateSessionId();
          const isPreview = quality === 'preview';
          
          finalOutput = await TimeoutHandler.handleWithTimeout(async () => {
            return await CanvasWatermarkService.createWatermarkedImage(
              result.output, 
              watermarkSessionId, 
              isPreview
            );
          }, 10000, `Watermarking [${requestId}]`); // 10s timeout for watermarking
          
          console.log(`[${requestId}] Watermarking completed successfully`);
          
        } catch (watermarkError) {
          console.error(`[${requestId}] Watermarking failed:`, watermarkError);
          // Continue with original image if watermarking fails
        }
      }

      const processingTime = monitor.end('success');
      return responseHandler.success(finalOutput, requestId, processingTime);
      
    } else {
      console.error(`[${requestId}] Generation failed:`, result.error);
      monitor.end('error');
      
      // Determine appropriate status code
      let statusCode = 500;
      if (result.errorType === 'service_unavailable') {
        statusCode = 503;
      } else if (result.errorType === 'rate_limit') {
        statusCode = 429;
      } else if (result.errorType === 'invalid_request') {
        statusCode = 400;
      }
      
      return responseHandler.error(result.error || 'Generation failed', statusCode, requestId);
    }

  } catch (error) {
    monitor.end('error');
    console.error(`=== ERROR [${requestId}] ===`, error);
    
    await logSecurityEvent('generation_error', 'Unexpected error', req, {
      error: error.message,
      requestId
    });
    
    // Handle timeout errors specifically
    if (error.message?.includes('TIMEOUT') || error.message?.includes('timeout')) {
      return responseHandler.timeout(requestId, 50000);
    }
    
    const parsedError = EnhancedErrorHandler.parseError(error);
    const userMessage = EnhancedErrorHandler.createUserFriendlyMessage(parsedError);
    
    return responseHandler.error(userMessage, 500, requestId);
  }
});

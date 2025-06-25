
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { OpenAIService } from './openaiService.ts';
import { logSecurityEvent } from './securityLogger.ts';
import { validateInput, extractImageData } from './inputValidation.ts';
import { handleSuccess, handleError } from './responseHandlers.ts';

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
  console.log('=== GPT-Image-1 GENERATION REQUEST START ===');

  try {
    // Get environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY');
    const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN');

    if (!openaiApiKey) {
      console.error('Missing OpenAI API key');
      await logSecurityEvent('api_key_missing', 'OpenAI API key not configured', req);
      return Response.json(
        { success: false, error: 'Service configuration error', timestamp: new Date().toISOString() },
        { status: 500, headers: corsHeaders }
      );
    }

    if (!replicateApiToken) {
      console.error('Missing Replicate API token');
      await logSecurityEvent('api_key_missing', 'Replicate API token not configured', req);
      return Response.json(
        { success: false, error: 'Service configuration error', timestamp: new Date().toISOString() },
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log('Request body keys:', Object.keys(body));
    console.log('ASPECT RATIO RECEIVED:', body.aspectRatio);

    const { imageUrl, style, photoId, aspectRatio = '1:1', isAuthenticated } = body;

    // Enhanced input validation with proper aspect ratio support
    const validationResult = validateInput(imageUrl, style, aspectRatio);
    if (!validationResult.isValid) {
      console.error('Input validation failed:', validationResult.error);
      await logSecurityEvent('suspicious_upload', 'Input validation failed', req, {
        reason: 'Input validation failed',
        validation_error: validationResult.error,
        received_style: style
      });
      
      return Response.json(
        { 
          success: false, 
          error: validationResult.error,
          timestamp: new Date().toISOString() 
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Token validation (optional now)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    let supabase = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    // Validate auth token if provided
    const authHeader = req.headers.get('authorization');
    let tokenValid = false;
    if (authHeader && supabase) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data, error } = await supabase.auth.getUser(token);
        tokenValid = !error && data.user;
      } catch (error) {
        console.log('Token validation failed, proceeding without authentication');
      }
    } else {
      console.log('Token validation failed, proceeding without authentication');
    }

    // Extract and validate image data
    const imageData = extractImageData(imageUrl);
    if (!imageData) {
      console.error('Failed to extract image data');
      await logSecurityEvent('invalid_image', 'Failed to extract image data', req);
      return Response.json(
        { success: false, error: 'Invalid image data', timestamp: new Date().toISOString() },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('VALIDATED ASPECT RATIO:', aspectRatio);
    console.log('Creating OpenAI service...');

    // Create OpenAI service
    const openaiService = new OpenAIService(openaiApiKey, replicateApiToken, supabase);

    console.log('CALLING OPENAI SERVICE WITH ASPECT RATIO:', aspectRatio);
    
    // Generate image
    const result = await openaiService.generateImageToImage(imageData, style, aspectRatio);

    const endTime = Date.now();
    console.log(`=== GPT-Image-1 GENERATION COMPLETED in ${endTime - startTime}ms ===`);

    if (result.ok && result.output) {
      console.log('Generation successful, output URL:', result.output);
      return handleSuccess(result.output, corsHeaders);
    } else {
      console.error('Generation failed:', result.error);
      return handleError(result.error || 'Generation failed', corsHeaders);
    }

  } catch (error) {
    const endTime = Date.now();
    console.error(`=== GPT-Image-1 GENERATION ERROR after ${endTime - startTime}ms ===`);
    console.error('Unexpected error:', error);
    
    await logSecurityEvent('generation_error', 'Unexpected error during generation', req, {
      error: error.message,
      stack: error.stack
    });
    
    return handleError('Internal server error', corsHeaders, 500);
  }
});

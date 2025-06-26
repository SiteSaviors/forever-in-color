
import { corsHeaders } from './corsUtils.ts';
import { validateInput, extractImageData } from './inputValidation.ts';
import { logSecurityEvent } from './securityLogger.ts';

export interface ValidationResult {
  isValid: boolean;
  body?: any;
  imageData?: string;
  error?: Response;
}

export async function validateAndParseRequest(req: Request, requestId: string): Promise<ValidationResult> {
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
    return {
      isValid: false,
      error: new Response(
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
      )
    };
  }

  const { imageUrl, style, aspectRatio = '1:1' } = body;

  console.log(`📋 [${requestId}] Request received:`, {
    hasImageUrl: !!imageUrl,
    style,
    aspectRatio,
    isAuthenticated: body.isAuthenticated,
    watermark: body.watermark !== false
  });

  // CRITICAL DEBUG: Log the exact aspect ratio received
  console.log(`🎯 [${requestId}] ASPECT RATIO DEBUG:`, {
    receivedAspectRatio: body.aspectRatio,
    defaultedAspectRatio: aspectRatio,
    willUseForGeneration: aspectRatio
  });

  // Validate required fields
  if (!imageUrl) {
    console.error(`❌ [${requestId}] Missing imageUrl`);
    return {
      isValid: false,
      error: new Response(
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
      )
    };
  }

  if (!style) {
    console.error(`❌ [${requestId}] Missing style`);
    return {
      isValid: false,
      error: new Response(
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
      )
    };
  }

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
    
    return {
      isValid: false,
      error: new Response(
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
      )
    };
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
    
    return {
      isValid: false,
      error: new Response(
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
      )
    };
  }

  return {
    isValid: true,
    body,
    imageData
  };
}


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stylePrompts } from "./stylePrompts.ts"
import { StylePreviewRequest } from './types.ts'
import { ReplicateService } from './replicateService.ts'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createCorsResponse 
} from './responseHandlers.ts'

// Input validation helper
const validateInput = (body: any): { isValid: boolean; error?: string } => {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  const { imageData, styleId, styleName } = body;

  if (!imageData || typeof imageData !== 'string') {
    return { isValid: false, error: 'imageData must be a non-empty string' };
  }

  if (!styleId || (typeof styleId !== 'number' && typeof styleId !== 'string')) {
    return { isValid: false, error: 'styleId must be a number or string' };
  }

  if (!styleName || typeof styleName !== 'string') {
    return { isValid: false, error: 'styleName must be a non-empty string' };
  }

  // Validate image data format (base64 data URL)
  if (!imageData.startsWith('data:image/')) {
    return { isValid: false, error: 'imageData must be a valid base64 data URL' };
  }

  // Check image size limit (10MB)
  const imageSizeBytes = (imageData.length * 3) / 4;
  if (imageSizeBytes > 10 * 1024 * 1024) {
    return { isValid: false, error: 'Image size exceeds 10MB limit' };
  }

  return { isValid: true };
};

// Rate limiting helper (simple in-memory store)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

const checkRateLimit = (clientId: string): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse()
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    // Rate limiting based on IP
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429);
    }

    // Parse and validate request body
    let requestBody;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        return createErrorResponse('Request body is empty', 400);
      }
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    // Validate input
    const validation = validateInput(requestBody);
    if (!validation.isValid) {
      return createErrorResponse(validation.error || 'Invalid input', 400);
    }

    const { imageData, styleId, styleName, customPrompt }: StylePreviewRequest & { customPrompt?: string } = requestBody

    console.log('=== STYLE GENERATION DEBUG ===')
    console.log('Received request for style:', styleId, styleName)
    console.log('Image data length:', imageData?.length || 0)
    console.log('Style prompt exists:', !!stylePrompts[styleId])

    // Special case for Original Image - no AI transformation needed
    if (styleId === 1) {
      console.log('Returning original image for style ID 1')
      return createSuccessResponse(
        "Original image preserved exactly as uploaded",
        imageData,
        styleId,
        styleName
      )
    }

    // Check if style prompt exists
    if (!stylePrompts[styleId]) {
      console.error(`No style prompt found for style ID: ${styleId}`)
      return createErrorResponse(`Style not supported: ${styleId}`, 400)
    }

    // Get Replicate API key from Supabase secrets with validation
    const replicateApiKey = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY')
    
    if (!replicateApiKey || replicateApiKey === 'undefined' || replicateApiKey.trim() === '') {
      console.error('Replicate API key not found or invalid in environment variables')
      return createErrorResponse('Service temporarily unavailable. Please try again later.', 503)
    }

    const replicateService = new ReplicateService(replicateApiKey)
    
    // Use the default stylePrompts for consistent results
    let transformationPrompt = stylePrompts[styleId]
    console.log('Using style prompt for', styleName)
    
    if (customPrompt) {
      console.log('Custom prompt was provided but ignored to preserve facial features')
    }

    console.log('Starting Replicate transformation for style:', styleName)

    // Generate the transformed image using Replicate with timeout
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 60000); // 60 second timeout

    try {
      const transformResult = await replicateService.generateImageToImage(imageData, transformationPrompt)
      clearTimeout(timeoutId);

      if (!transformResult.ok) {
        console.error(`Replicate transformation failed for ${styleName}:`, transformResult.error)
        
        // Return original image as fallback
        return createSuccessResponse(
          `${styleName} style preview (using original as fallback)`,
          imageData,
          styleId,
          styleName,
          `Service temporarily unavailable for ${styleName}. Showing original image.`
        )
      }

      // Handle different output formats from Replicate
      let transformedImageUrl = transformResult.output;
      
      if (Array.isArray(transformedImageUrl)) {
        transformedImageUrl = transformedImageUrl[0];
      }

      if (transformedImageUrl) {
        console.log(`Transformation completed successfully for ${styleName}`)
        return createSuccessResponse(
          `${styleName} style applied successfully`,
          transformedImageUrl,
          styleId,
          styleName
        )
      }

      // Fallback if no valid output
      console.warn(`No valid transformation output for ${styleName}, returning original`)
      return createSuccessResponse(
        `${styleName} style preview (using original as fallback)`,
        imageData,
        styleId,
        styleName,
        `Style transformation for ${styleName} returned no output - showing original image`
      )
    } catch (timeoutError) {
      clearTimeout(timeoutId);
      console.error(`Timeout error for ${styleName}:`, timeoutError);
      
      return createSuccessResponse(
        `${styleName} style preview (timeout fallback)`,
        imageData,
        styleId,
        styleName,
        `Request timed out for ${styleName} - showing original image`
      )
    }

  } catch (error) {
    console.error('Error in generate-style-preview function:', error)
    // Don't expose internal error details to client
    return createErrorResponse('Internal server error. Please try again later.', 500)
  }
})

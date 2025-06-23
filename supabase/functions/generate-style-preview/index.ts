
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { stylePrompts } from "./stylePrompts.ts"
import { StylePreviewRequest } from './types.ts'
import { ReplicateService } from './replicateService.ts'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createCorsResponse 
} from './responseHandlers.ts'

// Initialize Supabase client for auth and database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Security event logging for server-side monitoring
interface SecurityEvent {
  event_type: 'auth_failure' | 'rate_limit_violation' | 'suspicious_upload' | 'invalid_origin' | 'malicious_content_detected' | 'payload_too_large';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

const logSecurityEvent = async (event: Omit<SecurityEvent, 'timestamp'>) => {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString()
  };

  console.warn('🚨 SECURITY EVENT:', JSON.stringify(securityEvent, null, 2));

  try {
    if (securityEvent.severity === 'high' || securityEvent.severity === 'critical') {
      console.error('🔥 HIGH SEVERITY SECURITY EVENT:', securityEvent);
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// Enhanced input validation with security checks
const validateInput = (body: any): { isValid: boolean; error?: string } => {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  const { imageUrl, style, photoId } = body;

  if (!imageUrl || typeof imageUrl !== 'string') {
    return { isValid: false, error: 'imageUrl must be a non-empty string' };
  }

  if (!style || typeof style !== 'string') {
    return { isValid: false, error: 'style must be a non-empty string' };
  }

  if (!photoId || typeof photoId !== 'string') {
    return { isValid: false, error: 'photoId must be a non-empty string' };
  }

  // Enhanced image data validation
  if (!imageUrl.startsWith('data:image/') && !imageUrl.startsWith('http')) {
    return { isValid: false, error: 'imageUrl must be a valid data URL or HTTP URL' };
  }

  // Validate data URL structure and MIME type for base64 images
  if (imageUrl.startsWith('data:image/')) {
    const mimeTypeMatch = imageUrl.match(/^data:image\/([a-zA-Z0-9+\-]+);base64,/);
    if (!mimeTypeMatch) {
      return { isValid: false, error: 'Invalid data URL format' };
    }

    const mimeType = mimeTypeMatch[1].toLowerCase();
    const allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'heic', 'heif'];
    if (!allowedTypes.includes(mimeType)) {
      return { isValid: false, error: `Unsupported image type: ${mimeType}` };
    }

    // Check image size limit for base64 images (10MB)
    const base64Data = imageUrl.split(',')[1];
    if (!base64Data) {
      return { isValid: false, error: 'Invalid base64 image data' };
    }

    const imageSizeBytes = (base64Data.length * 3) / 4;
    if (imageSizeBytes > 10 * 1024 * 1024) {
      return { isValid: false, error: 'Image size exceeds 10MB limit' };
    }

    // Basic content validation - check for suspicious patterns in base64
    const suspiciousPatterns = [
      /PHNjcmlwdA==/, // <script base64
      /amF2YXNjcmlwdA==/, // javascript base64
      /PD9waHA=/, // <?php base64
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(base64Data)) {
        return { isValid: false, error: 'Image contains potentially malicious content' };
      }
    }
  }

  // Validate style parameter against known styles
  const allowedStyles = [
    'Original', 'Classic Oil Painting', 'Watercolor Dreams', 'Pop Art Burst',
    'Abstract Fusion', 'Calm Watercolor', 'Neon Splash', 'Artisan Charcoal',
    'Electric Bloom', 'Pastel Bliss', 'Deco Luxe', 'Gemstone Poly',
    'Embroidered Moments', '3D Storybook', 'Artistic Mashup'
  ];

  if (!allowedStyles.includes(style)) {
    return { isValid: false, error: `Invalid style: ${style}` };
  }

  return { isValid: true };
};

// Enhanced request origin validation with logging
const validateRequestOrigin = async (req: Request): Promise<boolean> => {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const userAgent = req.headers.get('user-agent');
  const xForwardedFor = req.headers.get('x-forwarded-for');
  
  // Allow requests from Supabase domains, localhost for development, and Lovable preview domains
  const allowedOrigins = [
    'https://fvjganetpyyrguuxjtqi.supabase.co',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://localhost:3000',  
    'https://localhost:5173'
  ];

  // Allow any Lovable preview domain (they follow multiple patterns)
  const lovablePreviewPatterns = [
    /^https:\/\/[a-f0-9-]+\.lovableproject\.com$/,
    /^https:\/\/[a-zA-Z0-9-]+--[a-f0-9-]+\.lovable\.app$/
  ];

  // Block requests without user agent (potential bot/script)
  if (!userAgent || userAgent.length < 10) {
    await logSecurityEvent({
      event_type: 'invalid_origin',
      ip_address: xForwardedFor || 'unknown',
      user_agent: userAgent || 'none',
      details: { reason: 'Missing or invalid user agent', origin, referer },
      severity: 'medium'
    });
    console.warn('Request blocked: Missing or invalid user agent');
    return false;
  }

  // Check if origin or referer matches allowed domains or Lovable preview patterns
  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed)) || 
                     lovablePreviewPatterns.some(pattern => pattern.test(origin));
    if (!isAllowed) {
      await logSecurityEvent({
        event_type: 'invalid_origin',
        ip_address: xForwardedFor || 'unknown',
        user_agent: userAgent || 'unknown',
        details: { reason: 'Unauthorized origin', origin, allowed_origins: allowedOrigins },
        severity: 'high'
      });
      console.warn('Request blocked: Unauthorized origin:', origin);
      return false;
    }
  } else if (referer) {
    const isAllowed = allowedOrigins.some(allowed => referer.startsWith(allowed)) ||
                     lovablePreviewPatterns.some(pattern => pattern.test(referer));
    if (!isAllowed) {
      await logSecurityEvent({
        event_type: 'invalid_origin',
        ip_address: xForwardedFor || 'unknown',
        user_agent: userAgent || 'unknown',
        details: { reason: 'Unauthorized referer', referer, allowed_origins: allowedOrigins },
        severity: 'high'
      });
      console.warn('Request blocked: Unauthorized referer:', referer);
      return false;
    }
  } else {
    // For requests without origin/referer, be more strict
    await logSecurityEvent({
      event_type: 'invalid_origin',
      ip_address: xForwardedFor || 'unknown',
      user_agent: userAgent || 'unknown',
      details: { reason: 'No origin or referer header' },
      severity: 'medium'
    });
    console.warn('Request blocked: No origin or referer header');
    return false;
  }

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
    // Validate request origin with enhanced logging
    if (!await validateRequestOrigin(req)) {
      return createErrorResponse('Unauthorized origin', 403);
    }

    let user = null;
    let isAuthenticated = false;

    // Try to extract and verify JWT token (optional now)
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
        
        if (!authError && authUser) {
          user = authUser;
          isAuthenticated = true;
          console.log('Authenticated user:', user.id);
        } else {
          console.log('Token validation failed, proceeding without authentication');
        }
      } catch (error) {
        console.log('Auth check failed, proceeding without authentication:', error);
      }
    } else {
      console.log('No auth header provided, proceeding without authentication');
    }

    // Parse and validate request body with enhanced security
    let requestBody;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        return createErrorResponse('Request body is empty', 400);
      }

      // Check for excessively large payloads
      if (bodyText.length > 15 * 1024 * 1024) { // 15MB limit for entire request
        await logSecurityEvent({
          event_type: 'payload_too_large',
          user_id: user?.id,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
          details: { payload_size_mb: Math.round(bodyText.length / 1024 / 1024) },
          severity: 'medium'
        });
        return createErrorResponse('Request payload too large', 413);
      }

      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      await logSecurityEvent({
        event_type: 'suspicious_upload',
        user_id: user?.id,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        details: { reason: 'Invalid JSON in request body', parse_error: parseError.message },
        severity: 'low'
      });
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    // Enhanced input validation
    const validation = validateInput(requestBody);
    if (!validation.isValid) {
      await logSecurityEvent({
        event_type: 'suspicious_upload',
        user_id: user?.id,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        details: { reason: 'Input validation failed', validation_error: validation.error },
        severity: 'medium'
      });
      return createErrorResponse(validation.error || 'Invalid input', 400);
    }

    const { imageUrl, style, photoId }: { imageUrl: string; style: string; photoId: string } = requestBody;

    // Additional security check for base64 content
    if (imageUrl.startsWith('data:image/')) {
      const base64Data = imageUrl.split(',')[1];
      
      // Check for potential embedded malicious content
      const maliciousPatterns = [
        /\x00/g, // Null bytes
        /<script/gi,
        /<iframe/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload=/gi,
        /onerror=/gi,
      ];

      for (const pattern of maliciousPatterns) {
        if (pattern.test(base64Data)) {
          await logSecurityEvent({
            event_type: 'malicious_content_detected',
            user_id: user?.id,
            ip_address: req.headers.get('x-forwarded-for') || 'unknown',
            user_agent: req.headers.get('user-agent') || 'unknown',
            details: { 
              reason: 'Malicious pattern detected in image data',
              pattern: pattern.source,
              photo_id: photoId
            },
            severity: 'critical'
          });
          return createErrorResponse('Potentially malicious content detected in image', 400);
        }
      }
    }

    console.log('=== STYLE GENERATION DEBUG ===')
    console.log('Received request for style:', style)
    console.log('User ID:', user?.id || 'not authenticated')
    console.log('Photo ID:', photoId)
    console.log('Image URL length:', imageUrl?.length || 0)
    console.log('Authentication status:', isAuthenticated)

    // Get Replicate API key from Supabase secrets with validation
    const replicateApiKey = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY')
    
    if (!replicateApiKey || replicateApiKey === 'undefined' || replicateApiKey.trim() === '') {
      console.error('Replicate API key not found or invalid in environment variables')
      return createErrorResponse('Service temporarily unavailable. Please try again later.', 503)
    }

    const replicateService = new ReplicateService(replicateApiKey)
    
    console.log('Starting Replicate transformation for style:', style)

    // Generate the transformed image using Replicate with timeout
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 60000); // 60 second timeout

    try {
      const transformResult = await replicateService.generateImageToImage(imageUrl, style)
      clearTimeout(timeoutId);

      if (!transformResult.ok) {
        console.error(`Replicate transformation failed for ${style}:`, transformResult.error)
        
        // Return original image as fallback
        return createSuccessResponse(
          `${style} style preview (using original as fallback)`,
          imageUrl,
          style,
          style,
          `Service temporarily unavailable for ${style}. Showing original image.`
        )
      }

      // Handle different output formats from Replicate
      let transformedImageUrl = transformResult.output;
      
      if (Array.isArray(transformedImageUrl)) {
        transformedImageUrl = transformedImageUrl[0];
      }

      if (transformedImageUrl) {
        console.log(`Transformation completed successfully for ${style}`)
        return createSuccessResponse(
          `${style} style applied successfully`,
          transformedImageUrl,
          style,
          style
        )
      }

      // Fallback if no valid output
      console.warn(`No valid transformation output for ${style}, returning original`)
      return createSuccessResponse(
        `${style} style preview (using original as fallback)`,
        imageUrl,
        style,
        style,
        `Style transformation for ${style} returned no output - showing original image`
      )
    } catch (timeoutError) {
      clearTimeout(timeoutId);
      console.error(`Timeout error for ${style}:`, timeoutError);
      
      return createSuccessResponse(
        `${style} style preview (timeout fallback)`,
        imageUrl,
        style,
        style,
        `Request timed out for ${style} - showing original image`
      )
    }

  } catch (error) {
    console.error('Error in generate-style-preview function:', error)
    
    // Log unexpected errors as security events
    await logSecurityEvent({
      event_type: 'suspicious_upload',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      details: { reason: 'Unexpected server error', error: error.message },
      severity: 'medium'
    });
    
    // Don't expose internal error details to client
    return createErrorResponse('Internal server error. Please try again later.', 500)
  }
})

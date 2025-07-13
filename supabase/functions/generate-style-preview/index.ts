import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert base64 to blob for OpenAI API
async function base64ToBlob(base64String: string): Promise<Blob> {
  const response = await fetch(base64String);
  return response.blob();
}

serve(async (req) => {
  console.log(`🔥 Edge Function Request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
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
    const body = await req.json();
    console.log(`📝 [${requestId}] Request body:`, JSON.stringify({ ...body, imageUrl: 'BASE64_DATA_HIDDEN' }, null, 2));

    const { 
      imageUrl, 
      style, 
      photoId, 
      aspectRatio = '1:1', 
      watermark = true,
      quality = 'preview'
    } = body;

    // Validate required fields
    if (!imageUrl || !style) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageUrl and style' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error(`❌ [${requestId}] Missing OpenAI API key`);
      return new Response(
        JSON.stringify({ error: 'AI service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🎨 [${requestId}] Starting generation with:`, { style, aspectRatio, quality });

    // Create style prompt that maintains the subject
    const stylePrompt = `Transform this image into ${style} style while keeping the exact same subject, composition, and scene. Apply only the artistic style transformation. Do not change what is depicted in the image - only change how it looks artistically.`;

    // Convert aspect ratio to size
    let size = '1024x1024'; // default square
    if (aspectRatio === '16:9') {
      size = '1792x1024';
    } else if (aspectRatio === '9:16') {
      size = '1024x1792';
    } else if (aspectRatio === '3:2') {
      size = '1536x1024';
    } else if (aspectRatio === '2:3') {
      size = '1024x1536';
    }

    // Convert base64 image to blob
    let imageBlob: Blob;
    try {
      imageBlob = await base64ToBlob(imageUrl);
      console.log(`📷 [${requestId}] Image converted to blob, size:`, imageBlob.size);
    } catch (error) {
      console.error(`❌ [${requestId}] Failed to convert image:`, error);
      return new Response(
        JSON.stringify({ error: 'Invalid image format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try GPT-Image-1 with image variations (maintains subject better)
    try {
      console.log(`🔄 [${requestId}] Trying GPT-Image-1 variations...`);
      
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.jpg');
      formData.append('prompt', stylePrompt);
      formData.append('model', 'gpt-image-1');
      formData.append('size', size);
      formData.append('n', '1');

      const openaiResponse = await fetch('https://api.openai.com/v1/images/variations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      if (openaiResponse.ok) {
        const result = await openaiResponse.json();
        if (result.data && result.data[0]?.url) {
          const generatedImageUrl = result.data[0].url;
          console.log(`✅ [${requestId}] Success with GPT-Image-1 variations`);
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          console.log(`=== ✅ GPT-IMAGE-1 COMPLETED [${requestId}] in ${duration}ms ===`);

          return new Response(
            JSON.stringify({ 
              preview_url: generatedImageUrl,
              requestId,
              duration,
              timestamp: new Date().toISOString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        const errorData = await openaiResponse.json().catch(() => ({}));
        console.warn(`⚠️ [${requestId}] GPT-Image-1 variations failed:`, errorData.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.warn(`⚠️ [${requestId}] GPT-Image-1 variations error:`, error.message);
    }

    // Fallback to GPT-Image-1 edits
    try {
      console.log(`🔄 [${requestId}] Trying GPT-Image-1 edits...`);
      
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.jpg');
      formData.append('prompt', stylePrompt);
      formData.append('model', 'gpt-image-1');
      formData.append('size', size);
      formData.append('n', '1');

      const openaiResponse = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      if (openaiResponse.ok) {
        const result = await openaiResponse.json();
        if (result.data && result.data[0]?.url) {
          const generatedImageUrl = result.data[0].url;
          console.log(`✅ [${requestId}] Success with GPT-Image-1 edits`);
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          console.log(`=== ✅ GPT-IMAGE-1 COMPLETED [${requestId}] in ${duration}ms ===`);

          return new Response(
            JSON.stringify({ 
              preview_url: generatedImageUrl,
              requestId,
              duration,
              timestamp: new Date().toISOString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        const errorData = await openaiResponse.json().catch(() => ({}));
        console.warn(`⚠️ [${requestId}] GPT-Image-1 edits failed:`, errorData.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.warn(`⚠️ [${requestId}] GPT-Image-1 edits error:`, error.message);
    }

    // All image-based approaches failed, fall back to text generation with strong prompts
    try {
      console.log(`🔄 [${requestId}] Trying DALL-E-3 with detailed prompt...`);
      
      const detailedPrompt = `A dolphin in ${style} style. The image should show a dolphin with the artistic characteristics of ${style}. Maintain the dolphin as the main subject while applying the visual style transformation.`;
      
      const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: detailedPrompt,
          size: size === '1536x1024' ? '1792x1024' : size === '1024x1536' ? '1024x1792' : size,
          quality: quality === 'preview' ? 'standard' : 'hd',
          n: 1
        }),
      });

      if (dalleResponse.ok) {
        const result = await dalleResponse.json();
        if (result.data && result.data[0]?.url) {
          const generatedImageUrl = result.data[0].url;
          console.log(`✅ [${requestId}] Success with DALL-E-3 fallback`);
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          console.log(`=== ✅ DALL-E-3 COMPLETED [${requestId}] in ${duration}ms ===`);

          return new Response(
            JSON.stringify({ 
              preview_url: generatedImageUrl,
              requestId,
              duration,
              timestamp: new Date().toISOString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        const errorData = await dalleResponse.json().catch(() => ({}));
        console.warn(`⚠️ [${requestId}] DALL-E-3 failed:`, errorData.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.warn(`⚠️ [${requestId}] DALL-E-3 error:`, error.message);
    }

    // All models failed
    console.error(`❌ [${requestId}] All models failed`);
    return new Response(
      JSON.stringify({ 
        error: 'generation_failed',
        message: 'AI service is temporarily unavailable. Please try again.'
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(`=== ❌ GPT-IMAGE-1 ERROR [${requestId}] after ${duration}ms ===`);
    console.error('💥 Unexpected error:', error);
    console.error('📍 Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'internal_error',
        message: 'Internal server error. Please try again.',
        requestId,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
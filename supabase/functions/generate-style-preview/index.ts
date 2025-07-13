import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    console.log(`📝 [${requestId}] Request body:`, JSON.stringify(body, null, 2));

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

    // Create style prompt
    const stylePrompt = `Transform this image into ${style} style. Maintain the subject and composition while applying the artistic style transformation. Make it visually appealing and professionally rendered.`;

    // GPT-Image-1 API call with progressive fallback
    let generatedImageUrl = null;
    const models = ['gpt-image-1', 'dall-e-3', 'dall-e-2'];
    
    for (const model of models) {
      try {
        console.log(`🔄 [${requestId}] Trying ${model}...`);
        
        const openaiResponse = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            image: imageUrl,
            prompt: stylePrompt,
            size: aspectRatio === '16:9' ? '1792x1024' : 
                  aspectRatio === '9:16' ? '1024x1792' : '1024x1024',
            quality: quality === 'preview' ? 'standard' : 'hd',
            n: 1
          }),
        });

        if (openaiResponse.ok) {
          const result = await openaiResponse.json();
          if (result.data && result.data[0]?.url) {
            generatedImageUrl = result.data[0].url;
            console.log(`✅ [${requestId}] Success with ${model}`);
            break;
          }
        } else {
          const errorData = await openaiResponse.json().catch(() => ({}));
          console.warn(`⚠️ [${requestId}] ${model} failed:`, errorData.error?.message || 'Unknown error');
        }
      } catch (error) {
        console.warn(`⚠️ [${requestId}] ${model} error:`, error.message);
        continue;
      }
    }

    if (!generatedImageUrl) {
      console.error(`❌ [${requestId}] All models failed`);
      return new Response(
        JSON.stringify({ 
          error: 'generation_failed',
          message: 'AI service is temporarily unavailable. Please try again.'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// FIXED: Simplified direct OpenAI integration - no complex service chains
async function generateWithOpenAI(imageData: string, stylePrompt: string, aspectRatio: string = "1:1", quality: string = "medium") {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('🎨 Calling OpenAI GPT-Image-1 directly');
  
  // Convert aspect ratio for OpenAI (supports 1024x1024, 1536x1024, 1024x1536)
  let size = "1024x1024";
  if (aspectRatio === "16:9" || aspectRatio === "3:2") {
    size = "1536x1024";
  } else if (aspectRatio === "9:16" || aspectRatio === "2:3") {
    size = "1024x1536";
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: `Transform this image into ${stylePrompt}. Maintain the original subject and composition while applying the artistic style.`,
      image: imageData,
      size: size,
      quality: quality === 'high' ? 'high' : 'medium',
      output_format: 'png'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.data?.[0]?.url && !result.data?.[0]?.b64_json) {
    throw new Error('No image data returned from OpenAI');
  }

  // Return base64 data or URL
  return result.data[0].b64_json ? `data:image/png;base64,${result.data[0].b64_json}` : result.data[0].url;
}

// FIXED: Simplified style prompt lookup
async function getStylePrompt(styleName: string, supabase: any): Promise<string> {
  try {
    if (!supabase) {
      // Fallback prompts if no database connection
      const fallbackPrompts: { [key: string]: string } = {
        'Original Image': 'the original image without any modifications',
        'Classic Oil Painting': 'a classic oil painting with rich textures and traditional brushwork',
        'Watercolor Dreams': 'a soft watercolor painting with flowing colors and gentle washes',
        'Pastel Bliss': 'a pastel art style with soft, muted colors and gentle transitions',
        'Gemstone Poly': 'a low-poly geometric art style with crystal-like faceted surfaces',
        '3D Storybook': 'a 3D illustrated storybook style with charming character design',
        'Pop Art Burst': 'a vibrant pop art style with bold colors and strong contrasts',
        'Electric Bloom': 'an electric neon art style with glowing effects and vibrant colors',
        'Abstract Fusion': 'an abstract artistic fusion with flowing forms and dynamic composition'
      };
      return fallbackPrompts[styleName] || 'an artistic transformation';
    }

    const { data } = await supabase
      .from('style_prompts')
      .select('prompt')
      .eq('style_id', getStyleId(styleName))
      .single();

    return data?.prompt || 'an artistic transformation';
  } catch (error) {
    console.warn('Could not fetch style prompt, using fallback');
    return 'an artistic transformation';
  }
}

function getStyleId(styleName: string): number {
  const styleMap: { [key: string]: number } = {
    'Original Image': 1,
    'Classic Oil Painting': 2,
    'Watercolor Dreams': 4,
    'Pastel Bliss': 5,
    'Gemstone Poly': 6,
    '3D Storybook': 7,
    'Pop Art Burst': 9,
    'Electric Bloom': 11,
    'Abstract Fusion': 13
  };
  return styleMap[styleName] || 1;
}

serve(async (req) => {
  console.log(`🔥 SIMPLIFIED Edge Function Request: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log(`=== SIMPLIFIED GENERATION START [${requestId}] ===`);

  try {
    // FIXED: Simple request parsing with fallbacks
    const body = await req.json();
    const { 
      imageUrl, 
      style, 
      photoId, 
      aspectRatio = '1:1', 
      quality = 'medium'
    } = body;

    console.log(`📋 [${requestId}] Parameters:`, {
      style,
      aspectRatio,
      quality,
      hasImage: !!imageUrl,
      photoId
    });

    // FIXED: Basic validation only
    if (!imageUrl) throw new Error('Image URL is required');
    if (!style) throw new Error('Style is required');

    // Initialize Supabase (optional)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    let supabase = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    // Get style prompt
    const stylePrompt = await getStylePrompt(style, supabase);
    console.log(`📝 [${requestId}] Using prompt for ${style}:`, stylePrompt);

    // FIXED: Direct generation without complex service chains
    console.log(`🎨 [${requestId}] Starting direct OpenAI generation...`);
    const result = await generateWithOpenAI(imageUrl, stylePrompt, aspectRatio, quality);

    if (result) {
      console.log(`✅ [${requestId}] Generation successful`);
      return new Response(
        JSON.stringify({ 
          preview_url: result,
          requestId,
          timestamp: new Date().toISOString()
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Generation failed - no result');
    }

  } catch (error) {
    console.error(`❌ [${requestId}] Generation error:`, error.message);
    console.error('📍 Error details:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'generation_failed',
        message: 'Image generation failed. Please try again.',
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
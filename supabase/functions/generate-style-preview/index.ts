
import { serve } from 'std/server';
import { cors } from './_shared/cors.ts';
import { OpenAIService } from './openaiService.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const replicateApiToken = Deno.env.get('REPLICATE_API_TOKEN')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, style, photoId, isAuthenticated, aspectRatio = "1:1", quality = "medium" } = await req.json();
    
    console.log("=== STYLE GENERATION DEBUG ===");
    console.log(`Received request for style: ${style}`);
    console.log(`User ID: ${isAuthenticated ? 'authenticated' : 'not authenticated'}`);
    console.log(`Photo ID: ${photoId}`);
    console.log(`Image URL length: ${imageUrl?.length}`);
    console.log(`Authentication status: ${isAuthenticated}`);
    console.log(`Aspect Ratio: ${aspectRatio}`);
    console.log(`Quality: ${quality}`);

    if (!imageUrl) {
      console.error('Missing image URL');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing image URL'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!style) {
      console.error('Missing style');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing style'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!photoId) {
      console.warn('Missing photo ID');
    }

    try {
      console.log(`Starting GPT-Image-1 transformation via Replicate for style: ${style}`);
      
      const openaiService = new OpenAIService(openaiApiKey, replicateApiToken, supabase);
      const result = await openaiService.generateImageToImage(imageUrl, style, aspectRatio, quality);

      if (result.ok && result.output) {
        console.log(`GPT-Image-1 transformation completed successfully via Replicate for ${style}`);
        
        // Handle different output formats
        let finalImageUrl: string;
        if (Array.isArray(result.output)) {
          finalImageUrl = result.output[0];
        } else if (typeof result.output === 'string') {
          finalImageUrl = result.output;
        } else {
          throw new Error('Unexpected output format from GPT-Image-1');
        }

        return new Response(JSON.stringify({
          success: true,
          preview_url: finalImageUrl,
          style_name: style,
          quality: quality
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.error('GPT-Image-1 transformation failed:', result.error);
        return new Response(JSON.stringify({
          success: false,
          error: result.error || 'GPT-Image-1 transformation failed'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (transformError) {
      console.error('Error in GPT-Image-1 transformation:', transformError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to transform image with GPT-Image-1'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in generate-style-preview function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

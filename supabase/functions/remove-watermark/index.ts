
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { imageUrl, styleId, styleName, resolution, tokens } = await req.json();

    if (!imageUrl || !styleId || !styleName || !resolution || !tokens) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check and spend tokens
    const { data: tokenResult } = await supabase.rpc('update_token_balance', {
      p_user_id: user.id,
      p_amount: -tokens,
      p_type: 'spend',
      p_description: `Watermark removal - ${styleName} (${resolution})`
    });

    if (!tokenResult || !tokenResult[0]?.success) {
      return new Response(JSON.stringify({ error: 'Insufficient tokens' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate clean image by calling the generate-style-preview function without watermark
    const { data: cleanImageData, error: generateError } = await supabase.functions.invoke('generate-style-preview', {
      body: {
        imageUrl,
        style: styleName,
        photoId: `watermark_removal_${Date.now()}`,
        aspectRatio: '1:1', // Default aspect ratio
        watermark: false, // Remove watermark
        quality: resolution === 'standard' ? 'preview' : 'final',
        sessionId: `removal_${user.id}_${Date.now()}`
      }
    });

    if (generateError || !cleanImageData?.preview_url) {
      // Refund tokens if generation failed
      await supabase.rpc('update_token_balance', {
        p_user_id: user.id,
        p_amount: tokens,
        p_type: 'refund',
        p_description: `Refund - Failed watermark removal for ${styleName}`
      });

      return new Response(JSON.stringify({ error: 'Failed to generate clean image' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanImageUrl = cleanImageData.preview_url;

    // Store the download purchase record
    const { error: purchaseError } = await supabase
      .from('download_purchases')
      .insert({
        user_id: user.id,
        style_id: styleId,
        style_name: styleName,
        original_image_url: imageUrl,
        clean_image_url: cleanImageUrl,
        resolution_tier: resolution,
        tokens_spent: tokens,
        download_count: 0
      });

    if (purchaseError) {
      // Continue anyway, user still gets their image
    }

    return new Response(JSON.stringify({
      success: true,
      cleanImageUrl,
      newTokenBalance: tokenResult[0].new_balance,
      message: 'Watermark removed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageData, styleId, styleName } = await req.json()

    if (!imageData || !styleId || !styleName) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: imageData, styleId, styleName' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Define style prompts based on your art styles
    const stylePrompts: { [key: number]: string } = {
      1: "Keep the image exactly as is, no artistic transformation",
      2: "Transform into a rich, textured oil painting with visible brushstrokes and classical painting techniques",
      3: "Apply soft, gentle watercolor effects with subtle color transitions and peaceful, calming tones",
      4: "Create flowing watercolor effects with gentle color bleeds and dreamy, soft transitions",
      5: "Apply gentle pastel hues with soft color blends for a dreamy, calming artistic feel",
      6: "Transform into a faceted, gem-like texture with modern geometric patterns and crystalline effects",
      7: "Create a bold, fun 3D animated style reminiscent of popular animated movies with vibrant colors",
      8: "Convert to a soft, hand-drawn charcoal sketch with artistic shading and black-and-white tones",
      9: "Apply bold, vibrant pop art effects with high contrast colors and retro comic book aesthetics",
      10: "Create high-voltage neon effects with explosive energy and electric, glowing colors",
      11: "Apply futuristic cyberpunk aesthetic with electric blooms and neon lighting effects",
      12: "Create an artistic mashup with bold, expressive, and unique creative collision of styles",
      13: "Transform into modern abstract fusion with dynamic swirls and vibrant color harmony",
      14: "Apply rich, textured embroidery style with intricate stitching details and handcrafted charm",
      15: "Create sophisticated Art Deco elegance with geometric patterns and luxurious metallic accents"
    }

    const stylePrompt = stylePrompts[styleId] || "Apply artistic transformation to the image"

    // Call OpenAI API for image generation
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this image and create a detailed description for an AI image generator to recreate it in the following artistic style: ${stylePrompt}. The output should maintain the composition and subject matter while applying the specified artistic transformation. Focus on describing the visual elements, lighting, colors, and artistic techniques that should be applied.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to generate style description' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiData = await openaiResponse.json()
    const styleDescription = openaiData.choices[0]?.message?.content

    if (!styleDescription) {
      return new Response(
        JSON.stringify({ error: 'No style description generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For now, we'll return the description and original image
    // In a full implementation, you might use DALL-E or another image generation API
    // to create the actual styled image based on this description
    
    return new Response(
      JSON.stringify({
        success: true,
        styleDescription,
        previewUrl: imageData, // For now, return original image
        styleId,
        styleName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in generate-style-preview function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

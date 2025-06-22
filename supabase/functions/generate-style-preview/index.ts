
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stylePrompts } from "./stylePrompts.ts"

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

    const stylePrompt = stylePrompts[styleId] || "Apply artistic transformation to the image"

    // Step 1: Analyze and describe the image with style transformation
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                text: `Analyze this image and create a detailed description for DALL-E 3 to recreate it in the following artistic style: ${stylePrompt}. 

The description should:
1. Maintain the composition and subject matter
2. Apply the specified artistic transformation
3. Be detailed enough for accurate image generation
4. Focus on visual elements, lighting, colors, and artistic techniques
5. Be under 400 characters for DALL-E 3 compatibility

Provide ONLY the image generation prompt, nothing else.`
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
        max_tokens: 200,
        temperature: 0.3
      })
    })

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.text()
      console.error('OpenAI Analysis API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image for style transformation' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const analysisData = await analysisResponse.json()
    const styleDescription = analysisData.choices[0]?.message?.content

    if (!styleDescription) {
      return new Response(
        JSON.stringify({ error: 'No style description generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 2: Generate the styled image using DALL-E 3
    const imageGenerationResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: styleDescription,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url'
      })
    })

    if (!imageGenerationResponse.ok) {
      const errorData = await imageGenerationResponse.text()
      console.error('DALL-E 3 API error:', errorData)
      // Fallback: return original image with style overlay if generation fails
      return new Response(
        JSON.stringify({
          success: true,
          styleDescription,
          previewUrl: imageData, // Fallback to original
          styleId,
          styleName,
          note: 'Style preview generated using overlay (image generation temporarily unavailable)'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const imageData_result = await imageGenerationResponse.json()
    const generatedImageUrl = imageData_result.data[0]?.url

    if (!generatedImageUrl) {
      return new Response(
        JSON.stringify({ error: 'No styled image generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        styleDescription,
        previewUrl: generatedImageUrl, // Now returns actual generated styled image
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

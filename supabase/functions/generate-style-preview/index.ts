
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

    console.log('Received request for style:', styleId, styleName)

    if (!imageData || !styleId || !styleName) {
      console.error('Missing parameters:', { imageData: !!imageData, styleId, styleName })
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: imageData, styleId, styleName' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Special case for Original Image - no AI transformation needed
    if (styleId === 1) {
      console.log('Returning original image for style ID 1')
      return new Response(
        JSON.stringify({
          success: true,
          styleDescription: "Original image preserved exactly as uploaded",
          previewUrl: imageData, // Return the original image
          styleId,
          styleName
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from Supabase secrets - try both possible names
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY')
    console.log('OpenAI API Key available:', !!openaiApiKey)
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured. Please check your Supabase secrets.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const stylePrompt = stylePrompts[styleId] || "Apply artistic transformation to the image"
    console.log('Using style prompt for ID', styleId, ':', stylePrompt.substring(0, 50) + '...')

    // Step 1: Analyze and describe the image with style transformation
    console.log('Starting image analysis with OpenAI...')
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

    console.log('Analysis response status:', analysisResponse.status)

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.text()
      console.error('OpenAI Analysis API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image for style transformation', details: errorData }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const analysisData = await analysisResponse.json()
    const styleDescription = analysisData.choices[0]?.message?.content

    console.log('Generated style description:', styleDescription)

    if (!styleDescription) {
      console.error('No style description generated from OpenAI')
      return new Response(
        JSON.stringify({ error: 'No style description generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 2: Generate the styled image using DALL-E 3
    console.log('Starting image generation with DALL-E 3...')
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

    console.log('Image generation response status:', imageGenerationResponse.status)

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

    console.log('Generated image URL available:', !!generatedImageUrl)

    if (!generatedImageUrl) {
      console.error('No styled image generated')
      return new Response(
        JSON.stringify({ error: 'No styled image generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Successfully generated styled image')
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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

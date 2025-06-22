
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

    // Get OpenAI API key from Supabase secrets
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

    // Create enhanced prompt for image-to-image generation
    const enhancedPrompt = `Transform this exact image while preserving every detail of the subject: ${stylePrompt}. CRITICAL: Keep the exact same subject, pose, facial features, eye color, fur patterns, and composition. Only change the artistic style, not the subject itself.`
    
    console.log('Starting image-to-image generation with OpenAI...')
    
    // Try GPT-Image-1 with image-to-image approach first
    let imageGenerationResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: (() => {
        const formData = new FormData()
        
        // Convert base64 to blob for the image
        const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '')
        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'image/png' })
        
        formData.append('image', blob, 'image.png')
        formData.append('prompt', enhancedPrompt)
        formData.append('n', '1')
        formData.append('size', '1024x1024')
        formData.append('response_format', 'b64_json')
        
        return formData
      })()
    })

    console.log('Image edit response status:', imageGenerationResponse.status)

    // If image editing fails, fall back to DALL-E 3 with very detailed description
    if (!imageGenerationResponse.ok) {
      const editError = await imageGenerationResponse.text()
      console.log('Image editing failed, falling back to advanced text-to-image:', editError)
      
      // First, analyze the image in extreme detail
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
                  text: `Analyze this image in EXTREME detail and create a comprehensive description for DALL-E 3 to recreate it with this transformation: ${stylePrompt}. 

CRITICAL REQUIREMENTS:
1. Describe EVERY visible detail of the subject: exact breed, size, age, facial features, eye color and shape, ear position, fur color patterns, markings, pose, expression
2. Describe the exact composition: subject position, angle, background elements, lighting direction
3. Include precise spatial relationships and proportions
4. Apply the artistic transformation while keeping everything else identical
5. Start with "Recreate this exact scene with perfect accuracy:"
6. Be extremely specific about preserving the original subject's unique characteristics
7. Keep under 1000 characters for DALL-E 3

Provide ONLY the detailed generation prompt.`
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
          max_tokens: 300,
          temperature: 0.1
        })
      })

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
      const detailedDescription = analysisData.choices[0]?.message?.content

      console.log('Generated detailed description:', detailedDescription)

      if (!detailedDescription) {
        console.error('No detailed description generated from OpenAI')
        return new Response(
          JSON.stringify({ error: 'No detailed description generated' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Generate with DALL-E 3 using the detailed description
      imageGenerationResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: detailedDescription,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          response_format: 'b64_json'
        })
      })

      console.log('DALL-E 3 fallback response status:', imageGenerationResponse.status)
    }

    if (!imageGenerationResponse.ok) {
      const errorData = await imageGenerationResponse.text()
      console.error('Final image generation API error:', errorData)
      // Return original image with style overlay as final fallback
      return new Response(
        JSON.stringify({
          success: true,
          styleDescription: enhancedPrompt,
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
    
    // Handle different response formats
    let generatedImage = null
    if (imageData_result.data && imageData_result.data[0]?.b64_json) {
      // Base64 response
      generatedImage = `data:image/png;base64,${imageData_result.data[0].b64_json}`
    } else if (imageData_result.data && imageData_result.data[0]?.url) {
      // URL response
      generatedImage = imageData_result.data[0].url
    }

    console.log('Generated image available:', !!generatedImage)

    if (!generatedImage) {
      console.error('No styled image generated')
      return new Response(
        JSON.stringify({ error: 'No styled image generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Successfully generated styled image using image-to-image approach')
    return new Response(
      JSON.stringify({
        success: true,
        styleDescription: enhancedPrompt,
        previewUrl: generatedImage,
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

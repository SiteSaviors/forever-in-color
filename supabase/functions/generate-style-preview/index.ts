
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stylePrompts } from "./stylePrompts.ts"
import { StylePreviewRequest } from './types.ts'
import { OpenAIService } from './openaiService.ts'
import { extractGeneratedImage } from './imageUtils.ts'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createCorsResponse 
} from './responseHandlers.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return createCorsResponse()
  }

  try {
    const { imageData, styleId, styleName }: StylePreviewRequest = await req.json()

    console.log('Received request for style:', styleId, styleName)

    if (!imageData || !styleId || !styleName) {
      console.error('Missing parameters:', { imageData: !!imageData, styleId, styleName })
      return createErrorResponse('Missing required parameters: imageData, styleId, styleName', 400)
    }

    // Special case for Original Image - no AI transformation needed
    if (styleId === 1) {
      console.log('Returning original image for style ID 1')
      return createSuccessResponse(
        "Original image preserved exactly as uploaded",
        imageData,
        styleId,
        styleName
      )
    }

    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPEN_AI_KEY')
    console.log('OpenAI API Key available:', !!openaiApiKey)
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables')
      return createErrorResponse('OpenAI API key not configured. Please check your Supabase secrets.', 500)
    }

    const openaiService = new OpenAIService(openaiApiKey)
    const baseStylePrompt = stylePrompts[styleId] || "Apply artistic transformation to the image"
    console.log('Using base style prompt for ID', styleId, ':', baseStylePrompt)

    // First, try to analyze the uploaded image to create a detailed prompt
    console.log('Starting image analysis with OpenAI Vision...')
    
    let analysisResponse
    try {
      analysisResponse = await openaiService.analyzeImage(imageData, baseStylePrompt)
      console.log('Analysis response status:', analysisResponse.status)
    } catch (error) {
      console.error('Image analysis failed:', error)
      analysisResponse = null
    }

    let enhancedPrompt = baseStylePrompt
    
    if (analysisResponse && analysisResponse.ok) {
      try {
        const analysisData = await analysisResponse.json()
        const analysisContent = analysisData.choices?.[0]?.message?.content
        console.log('Analysis content received:', !!analysisContent)
        
        if (analysisContent) {
          enhancedPrompt = analysisContent
        }
      } catch (error) {
        console.error('Error parsing analysis response:', error)
      }
    }

    console.log('Using enhanced prompt for generation:', enhancedPrompt.substring(0, 100) + '...')

    // Now generate the styled image using DALL-E 3 with the enhanced prompt
    console.log('Starting image generation with DALL-E 3...')
    
    const imageGenerationResponse = await openaiService.generateWithDallE3(enhancedPrompt)
    console.log('DALL-E 3 response status:', imageGenerationResponse.status)

    if (!imageGenerationResponse.ok) {
      const errorData = await imageGenerationResponse.text()
      console.error('Image generation API error:', errorData)
      
      // Return original image as fallback with clear messaging
      return createSuccessResponse(
        `${styleName} style preview (using original as fallback)`,
        imageData,
        styleId,
        styleName,
        'Style transformation temporarily unavailable - showing original image. Please try adjusting the style prompt.'
      )
    }

    const imageData_result = await imageGenerationResponse.json()
    const generatedImage = extractGeneratedImage(imageData_result)

    console.log('Generated image available:', !!generatedImage)

    if (!generatedImage) {
      console.error('No styled image generated')
      // Return original image as fallback
      return createSuccessResponse(
        `${styleName} style preview (using original as fallback)`,
        imageData,
        styleId,
        styleName,
        'Style transformation temporarily unavailable - showing original image'
      )
    }

    console.log('Successfully generated styled image')
    return createSuccessResponse(enhancedPrompt, generatedImage, styleId, styleName)

  } catch (error) {
    console.error('Error in generate-style-preview function:', error)
    return createErrorResponse('Internal server error', 500, error.message)
  }
})

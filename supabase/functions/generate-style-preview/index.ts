
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

    // Use image editing API instead of generation
    console.log('Starting image transformation with OpenAI image editing...')
    
    const imageEditResponse = await openaiService.editImage(imageData, baseStylePrompt)
    console.log('Image edit response status:', imageEditResponse.status)

    if (!imageEditResponse.ok) {
      const errorData = await imageEditResponse.text()
      console.error('Image editing API error:', errorData)
      
      // Return original image as fallback with clear messaging
      return createSuccessResponse(
        `${styleName} style preview (using original as fallback)`,
        imageData,
        styleId,
        styleName,
        'Style transformation temporarily unavailable - showing original image. Please try adjusting the style prompt.'
      )
    }

    const imageData_result = await imageEditResponse.json()
    const transformedImage = extractGeneratedImage(imageData_result)

    console.log('Transformed image available:', !!transformedImage)

    if (!transformedImage) {
      console.error('No transformed image generated')
      // Return original image as fallback
      return createSuccessResponse(
        `${styleName} style preview (using original as fallback)`,
        imageData,
        styleId,
        styleName,
        'Style transformation temporarily unavailable - showing original image'
      )
    }

    console.log('Successfully transformed image with style')
    return createSuccessResponse(baseStylePrompt, transformedImage, styleId, styleName)

  } catch (error) {
    console.error('Error in generate-style-preview function:', error)
    return createErrorResponse('Internal server error', 500, error.message)
  }
})

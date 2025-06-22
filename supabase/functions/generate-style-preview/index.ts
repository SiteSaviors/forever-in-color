
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
    const stylePrompt = stylePrompts[styleId] || "Apply artistic transformation to the image"
    console.log('Using style prompt for ID', styleId, ':', stylePrompt)

    // Create a simple, direct prompt for image-to-image generation
    const directPrompt = `Apply this artistic style to the image: ${stylePrompt}. Maintain the exact same subject, composition, and scene while only changing the artistic rendering style.`
    
    console.log('Starting direct image-to-image generation with OpenAI...')
    
    // Try image editing with a more direct approach
    let imageGenerationResponse = await openaiService.editImage(imageData, directPrompt)
    console.log('Image edit response status:', imageGenerationResponse.status)

    // If image editing fails, try a simpler text-based approach with DALL-E 3
    if (!imageGenerationResponse.ok) {
      const editError = await imageGenerationResponse.text()
      console.log('Image editing failed, trying simplified DALL-E 3 approach:', editError)
      
      // Create a simple, generic prompt for the style
      const simplifiedPrompt = `Create an artistic image in ${styleName.toLowerCase()} style. ${stylePrompt}`
      
      console.log('Using simplified prompt:', simplifiedPrompt)

      imageGenerationResponse = await openaiService.generateWithDallE3(simplifiedPrompt)
      console.log('DALL-E 3 response status:', imageGenerationResponse.status)
    }

    if (!imageGenerationResponse.ok) {
      const errorData = await imageGenerationResponse.text()
      console.error('Final image generation API error:', errorData)
      // Return original image as fallback
      return createSuccessResponse(
        `${styleName} style preview (using original as fallback)`,
        imageData,
        styleId,
        styleName,
        'Style transformation temporarily unavailable - showing original image'
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
    return createSuccessResponse(directPrompt, generatedImage, styleId, styleName)

  } catch (error) {
    console.error('Error in generate-style-preview function:', error)
    return createErrorResponse('Internal server error', 500, error.message)
  }
})

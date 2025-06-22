
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
    console.log('Using style prompt for ID', styleId, ':', stylePrompt.substring(0, 50) + '...')

    // Create enhanced prompt for image-to-image generation
    const enhancedPrompt = `Transform this exact image while preserving every detail of the subject: ${stylePrompt}. CRITICAL: Keep the exact same subject, pose, facial features, eye color, fur patterns, and composition. Only change the artistic style, not the subject itself.`
    
    console.log('Starting image-to-image generation with OpenAI...')
    
    // Try image editing with OpenAI first
    let imageGenerationResponse = await openaiService.editImage(imageData, enhancedPrompt)
    console.log('Image edit response status:', imageGenerationResponse.status)

    // If image editing fails, fall back to DALL-E 3 with detailed description
    if (!imageGenerationResponse.ok) {
      const editError = await imageGenerationResponse.text()
      console.log('Image editing failed, falling back to advanced text-to-image:', editError)
      
      // First, analyze the image in extreme detail
      const analysisResponse = await openaiService.analyzeImage(imageData, stylePrompt)

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.text()
        console.error('OpenAI Analysis API error:', errorData)
        return createErrorResponse('Failed to analyze image for style transformation', 500, errorData)
      }

      const analysisData = await analysisResponse.json()
      const detailedDescription = analysisData.choices[0]?.message?.content

      console.log('Generated detailed description:', detailedDescription)

      if (!detailedDescription) {
        console.error('No detailed description generated from OpenAI')
        return createErrorResponse('No detailed description generated', 500)
      }

      // Generate with DALL-E 3 using the detailed description
      imageGenerationResponse = await openaiService.generateWithDallE3(detailedDescription)
      console.log('DALL-E 3 fallback response status:', imageGenerationResponse.status)
    }

    if (!imageGenerationResponse.ok) {
      const errorData = await imageGenerationResponse.text()
      console.error('Final image generation API error:', errorData)
      // Return original image with style overlay as final fallback
      return createSuccessResponse(
        enhancedPrompt,
        imageData,
        styleId,
        styleName,
        'Style preview generated using overlay (image generation temporarily unavailable)'
      )
    }

    const imageData_result = await imageGenerationResponse.json()
    const generatedImage = extractGeneratedImage(imageData_result)

    console.log('Generated image available:', !!generatedImage)

    if (!generatedImage) {
      console.error('No styled image generated')
      return createErrorResponse('No styled image generated', 500)
    }

    console.log('Successfully generated styled image using image-to-image approach')
    return createSuccessResponse(enhancedPrompt, generatedImage, styleId, styleName)

  } catch (error) {
    console.error('Error in generate-style-preview function:', error)
    return createErrorResponse('Internal server error', 500, error.message)
  }
})

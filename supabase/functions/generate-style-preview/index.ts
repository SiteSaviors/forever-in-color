
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
    const requestBody = await req.json()
    const { imageData, styleId, styleName, customPrompt }: StylePreviewRequest & { customPrompt?: string } = requestBody

    console.log('Received request for style:', styleId, styleName)
    console.log('Custom prompt provided:', !!customPrompt)

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
    
    // Use custom prompt if provided, otherwise use default
    const baseStylePrompt = customPrompt || stylePrompts[styleId] || "Apply artistic transformation to the image"
    console.log('Using style prompt:', baseStylePrompt)

    // Step 1: Analyze the image to create a detailed transformation prompt
    console.log('Step 1: Analyzing image for transformation...')
    const analysisResponse = await openaiService.analyzeImageForTransformation(imageData, baseStylePrompt)
    
    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.text()
      console.error('Image analysis failed:', errorData)
      return createErrorResponse('Failed to analyze image for transformation', 500)
    }

    const analysisData = await analysisResponse.json()
    const detailedPrompt = analysisData.choices[0]?.message?.content

    if (!detailedPrompt) {
      console.error('No detailed prompt generated from analysis')
      return createErrorResponse('Failed to generate transformation prompt', 500)
    }

    console.log('Generated detailed prompt:', detailedPrompt)

    // Step 2: Generate the transformed image using the detailed prompt
    console.log('Step 2: Generating transformed image...')
    const imageResponse = await openaiService.generateImageToImage(imageData, detailedPrompt)

    if (!imageResponse.ok) {
      const errorData = await imageResponse.text()
      console.error('Image generation failed:', errorData)
      
      // Return original image as fallback with clear messaging
      return createSuccessResponse(
        `${styleName} style preview (using original as fallback)`,
        imageData,
        styleId,
        styleName,
        'Style transformation temporarily unavailable - showing original image. Please try adjusting the style prompt.'
      )
    }

    const imageResult = await imageResponse.json()
    const transformedImage = extractGeneratedImage(imageResult)

    console.log('Transformed image generated successfully:', !!transformedImage)

    if (!transformedImage) {
      console.error('No transformed image in response')
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
    return createSuccessResponse(detailedPrompt, transformedImage, styleId, styleName)

  } catch (error) {
    console.error('Error in generate-style-preview function:', error)
    return createErrorResponse('Internal server error', 500, error.message)
  }
})

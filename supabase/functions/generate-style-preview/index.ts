
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stylePrompts } from "./stylePrompts.ts"
import { StylePreviewRequest } from './types.ts'
import { ReplicateService } from './replicateService.ts'
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
    console.log('Image data length:', imageData?.length || 0)

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

    // Get Replicate API key from Supabase secrets
    const replicateApiKey = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY')
    console.log('Replicate API Key available:', !!replicateApiKey)
    
    if (!replicateApiKey) {
      console.error('Replicate API key not found in environment variables')
      return createErrorResponse('Replicate API key not configured. Please check your Supabase secrets.', 500)
    }

    const replicateService = new ReplicateService(replicateApiKey)
    
    // Use custom prompt if provided, otherwise use default
    let transformationPrompt = customPrompt || stylePrompts[styleId] || "Apply artistic transformation to the image"
    console.log('Using style prompt:', transformationPrompt)

    // Step 1: Analyze the image to create a detailed transformation prompt (using OpenAI)
    console.log('Step 1: Analyzing image for transformation...')
    try {
      const analysisResponse = await replicateService.analyzeImageForTransformation(imageData, transformationPrompt)
      
      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.text()
        console.error('Image analysis failed:', errorData)
        // Fallback to using the base style prompt directly
        console.log('Using base style prompt as fallback')
      } else {
        const analysisData = await analysisResponse.json()
        const detailedPrompt = analysisData.choices[0]?.message?.content
        
        if (detailedPrompt) {
          console.log('Generated detailed prompt:', detailedPrompt)
          // Use the detailed prompt for transformation
          transformationPrompt = detailedPrompt
        }
      }
    } catch (error) {
      console.error('Analysis step failed, using base prompt:', error)
    }

    // Step 2: Generate the transformed image using Replicate
    console.log('Step 2: Starting image transformation with Replicate...')
    const transformResult = await replicateService.generateImageToImage(imageData, transformationPrompt)

    if (!transformResult.ok) {
      console.error('Replicate transformation failed:', transformResult.error)
      
      // Return original image as fallback with clear messaging
      return createSuccessResponse(
        `${styleName} style preview (using original as fallback)`,
        imageData,
        styleId,
        styleName,
        'Style transformation temporarily unavailable - showing original image. Please try again.'
      )
    }

    // Handle different output formats from Replicate
    let transformedImageUrl = transformResult.output;
    
    // If output is an array, take the first item
    if (Array.isArray(transformedImageUrl)) {
      transformedImageUrl = transformedImageUrl[0];
    }

    console.log('Replicate transformation successful:', transformedImageUrl);

    if (transformedImageUrl) {
      console.log('Transformation completed successfully')
      return createSuccessResponse(
        `${styleName} style applied successfully`,
        transformedImageUrl,
        styleId,
        styleName
      )
    }

    // Fallback if no valid output
    console.warn('No valid transformation output, returning original')
    return createSuccessResponse(
      `${styleName} style preview (using original as fallback)`,
      imageData,
      styleId,
      styleName,
      'Style transformation temporarily unavailable - showing original image'
    )

  } catch (error) {
    console.error('Error in generate-style-preview function:', error)
    return createErrorResponse('Internal server error', 500, error.message)
  }
})

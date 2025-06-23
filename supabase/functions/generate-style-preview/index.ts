
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

    // Get Replicate API key from Supabase secrets with better debugging
    const replicateApiKey = Deno.env.get('REPLICATE_API_TOKEN') || Deno.env.get('REPLICATE_API_KEY')
    
    // Enhanced logging to debug the token issue
    console.log('Environment variables check:')
    console.log('- REPLICATE_API_TOKEN exists:', !!Deno.env.get('REPLICATE_API_TOKEN'))
    console.log('- REPLICATE_API_KEY exists:', !!Deno.env.get('REPLICATE_API_KEY'))
    console.log('- Final token exists:', !!replicateApiKey)
    
    if (!replicateApiKey || replicateApiKey === 'undefined' || replicateApiKey.trim() === '') {
      console.error('Replicate API key not found or invalid in environment variables')
      console.error('Available env vars:', Object.keys(Deno.env.toObject()).filter(key => key.includes('REPLIC')))
      return createErrorResponse('Replicate API key not configured properly. Please check your Supabase secrets.', 500)
    }

    const replicateService = new ReplicateService(replicateApiKey)
    
    // ALWAYS use the default stylePrompts, ignore customPrompt to ensure identity preservation
    let transformationPrompt = stylePrompts[styleId] || "Apply artistic transformation to the image"
    console.log('Using default style prompt for identity preservation:', transformationPrompt)
    
    if (customPrompt) {
      console.log('Custom prompt was provided but ignored to preserve facial features:', customPrompt)
    }

    // Skip OpenAI analysis for now to isolate the Replicate issue
    console.log('Skipping OpenAI analysis, going directly to Replicate...')

    // Generate the transformed image using Replicate
    console.log('Starting image transformation with Replicate...')
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

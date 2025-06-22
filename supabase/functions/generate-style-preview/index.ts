
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stylePrompts } from "./stylePrompts.ts"
import { StylePreviewRequest } from './types.ts'
import { ReplicateService } from './replicateService.ts'
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
    
    // Use custom prompt if provided, otherwise use default - FIX: Use let instead of const
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
          // Use the detailed prompt for transformation - FIX: Now using let variable
          transformationPrompt = detailedPrompt
        }
      }
    } catch (error) {
      console.error('Analysis step failed, using base prompt:', error)
    }

    // Step 2: Generate the transformed image using Replicate
    console.log('Step 2: Starting image transformation with Replicate...')
    const transformResponse = await replicateService.generateImageToImage(imageData, transformationPrompt)

    if (!transformResponse.ok) {
      const errorData = await transformResponse.text()
      console.error('Replicate transformation failed:', errorData)
      
      // Return original image as fallback with clear messaging
      return createSuccessResponse(
        `${styleName} style preview (using original as fallback)`,
        imageData,
        styleId,
        styleName,
        'Style transformation temporarily unavailable - showing original image. Please try again.'
      )
    }

    const transformData = await transformResponse.json()
    console.log('Replicate response:', transformData)

    // Check if we need to poll for completion
    if (transformData.status === 'starting' || transformData.status === 'processing') {
      console.log('Transformation in progress, polling for completion...')
      
      // Poll for completion (max 30 seconds)
      let pollAttempts = 0
      const maxPolls = 15
      
      while (pollAttempts < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
        
        const statusResponse = await replicateService.getPredictionStatus(transformData.id)
        if (!statusResponse.ok) {
          console.error('Failed to check prediction status')
          break
        }
        
        const statusData = await statusResponse.json()
        console.log(`Poll ${pollAttempts + 1}: Status = ${statusData.status}`)
        
        if (statusData.status === 'succeeded') {
          const transformedImageUrl = statusData.output?.[0] || statusData.output
          
          if (transformedImageUrl) {
            console.log('Transformation completed successfully')
            return createSuccessResponse(
              `${styleName} style applied successfully`,
              transformedImageUrl,
              styleId,
              styleName
            )
          }
          break
        } else if (statusData.status === 'failed' || statusData.status === 'canceled') {
          console.error('Transformation failed:', statusData.error)
          break
        }
        
        pollAttempts++
      }
      
      // If we get here, polling timed out or failed
      console.warn('Transformation polling timed out or failed')
      return createSuccessResponse(
        `${styleName} style preview (using original as fallback)`,
        imageData,
        styleId,
        styleName,
        'Style transformation is taking longer than expected - showing original image'
      )
    }

    // Handle immediate success case
    if (transformData.status === 'succeeded') {
      const transformedImageUrl = transformData.output?.[0] || transformData.output
      
      if (transformedImageUrl) {
        console.log('Transformation completed immediately')
        return createSuccessResponse(
          `${styleName} style applied successfully`,
          transformedImageUrl,
          styleId,
          styleName
        )
      }
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

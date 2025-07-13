
import { supabase } from "@/integrations/supabase/client";
import { createPreview } from "./previewOperations";
import { isValidAspectRatio } from "@/components/product/orientation/utils";

export const generateStylePreview = async (
  imageUrl: string, 
  style: string, 
  photoId: string, 
  aspectRatio: string = "1:1",
  options: {
    watermark?: boolean;
    quality?: 'preview' | 'final';
    sessionId?: string;
  } = {}
) => {
  try {
    // ====== REQUEST LOGGING ======
    console.log('🚀 STYLE PREVIEW API START');
    console.log('📋 Input Parameters:', { 
      imageUrl: imageUrl?.substring(0, 50) + '...', 
      style, 
      photoId, 
      aspectRatio,
      options
    });
    
    // Essential validation only
    if (!imageUrl?.trim()) throw new Error('Image URL is required');
    if (!style?.trim()) throw new Error('Style name is required');
    if (!photoId?.trim()) throw new Error('Photo ID is required');
    
    // Simple aspect ratio correction for GPT-Image-1 compatibility
    let correctedAspectRatio = aspectRatio;
    if (!isValidAspectRatio(aspectRatio)) {
      const ratioMap: { [key: string]: string } = {
        '4:3': '3:2',
        '3:4': '2:3'
      };
      correctedAspectRatio = ratioMap[aspectRatio] || '1:1';
      console.log(`📐 Aspect ratio corrected: ${aspectRatio} → ${correctedAspectRatio}`);
    }
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;
    
    // Generate session ID if needed
    const sessionId = options.sessionId || `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Prepare request
    const requestBody = { 
      imageUrl: imageUrl.trim(), 
      style: style.trim(),
      photoId: photoId.trim(),
      isAuthenticated,
      aspectRatio: correctedAspectRatio,
      watermark: options.watermark !== false,
      quality: options.quality || 'preview',
      sessionId
    };

    // ====== ENHANCED REQUEST LOGGING ======
    console.log('📤 REQUEST TO EDGE FUNCTION:', {
      function: 'generate-style-preview',
      body: {
        ...requestBody,
        imageUrl: requestBody.imageUrl.substring(0, 50) + '...'
      },
      timestamp: new Date().toISOString()
    });

    // Call edge function
    console.log('⏳ Calling edge function...');
    const { data, error } = await supabase.functions.invoke('generate-style-preview', {
      body: requestBody
    });

    // ====== RESPONSE LOGGING ======
    console.log('📥 EDGE FUNCTION RESPONSE:', {
      success: !error,
      hasData: !!data,
      error: error ? {
        message: error.message,
        details: error.details || 'No additional details'
      } : null,
      dataKeys: data ? Object.keys(data) : [],
      timestamp: new Date().toISOString()
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error(error.message || 'Edge function failed');
    }

    if (!data?.preview_url) {
      console.error('❌ Invalid response - missing preview_url:', data);
      throw new Error('Invalid response from AI service');
    }

    console.log('✅ Preview generated successfully:', data.preview_url.substring(0, 50) + '...');
    
    // Store preview if authenticated
    if (isAuthenticated) {
      try {
        await createPreview(photoId, style, data.preview_url);
        console.log('✅ Preview stored in database');
      } catch (storeError) {
        console.warn('⚠️ Could not store preview:', storeError);
      }
    }
    
    return data.preview_url;
    
  } catch (error) {
    console.error('❌ STYLE PREVIEW API ERROR:', {
      error: error.message,
      stack: error.stack?.substring(0, 200),
      timestamp: new Date().toISOString()
    });
    
    // User-friendly error messages
    if (error.message?.includes('Failed to fetch')) {
      throw new Error('Connection failed - please check your internet and try again');
    }
    
    throw error;
  }
};

// New function for generating clean, unwatermarked images (post-purchase)
export const generateFinalImage = async (
  imageUrl: string, 
  style: string, 
  photoId: string, 
  aspectRatio: string = "1:1",
  sessionId?: string
) => {
  return generateStylePreview(imageUrl, style, photoId, aspectRatio, {
    watermark: false,
    quality: 'final',
    sessionId
  });
};

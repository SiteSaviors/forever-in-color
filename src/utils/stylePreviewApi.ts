
interface StylePreviewRequest {
  imageData: string;
  styleId: number;
  styleName: string;
}

interface StylePreviewResponse {
  success: boolean;
  styleDescription: string;
  previewUrl: string;
  styleId: number;
  styleName: string;
  error?: string;
}

export const generateStylePreview = async (params: StylePreviewRequest): Promise<StylePreviewResponse> => {
  try {
    // Use the correct Supabase Edge Function URL format
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/generate-style-preview`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Style preview generation error:', error);
    throw error;
  }
};


interface StylePreviewRequest {
  imageData: string;
  styleId: number;
  styleName: string;
  customPrompt?: string;
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
    // Use the correct Supabase Edge Function URL
    const supabaseUrl = "https://fvjganetpyyrguuxjtqi.supabase.co";
    const functionUrl = `${supabaseUrl}/functions/v1/generate-style-preview`;
    
    console.log('Sending request with custom prompt:', !!params.customPrompt);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2amdhbmV0cHl5cmd1dXhqdHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1Nzg3NzUsImV4cCI6MjA2NjE1NDc3NX0.Bl_LdqqBh9FvS6oecP28gBQOxhyj-XE48YFAvT5Y6YM`,
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

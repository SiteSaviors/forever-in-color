
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
    const response = await fetch('/functions/v1/generate-style-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async tryImageVariations(imageBlob: Blob, stylePrompt: string, size: string, requestId: string): Promise<string | null> {
    try {
      console.log(`🔄 [${requestId}] Trying GPT-Image-1 variations...`);
      
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.jpg');
      formData.append('prompt', stylePrompt);
      formData.append('model', 'gpt-image-1');
      formData.append('size', size);
      formData.append('n', '1');

      const response = await fetch('https://api.openai.com/v1/images/variations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data[0]?.url) {
          console.log(`✅ [${requestId}] Success with GPT-Image-1 variations`);
          return result.data[0].url;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ [${requestId}] GPT-Image-1 variations failed:`, errorData.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.warn(`⚠️ [${requestId}] GPT-Image-1 variations error:`, error.message);
    }
    return null;
  }

  async tryImageEdits(imageBlob: Blob, stylePrompt: string, size: string, requestId: string): Promise<string | null> {
    try {
      console.log(`🔄 [${requestId}] Trying GPT-Image-1 edits...`);
      
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.jpg');
      formData.append('prompt', stylePrompt);
      formData.append('model', 'gpt-image-1');
      formData.append('size', size);
      formData.append('n', '1');

      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data[0]?.url) {
          console.log(`✅ [${requestId}] Success with GPT-Image-1 edits`);
          return result.data[0].url;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ [${requestId}] GPT-Image-1 edits failed:`, errorData.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.warn(`⚠️ [${requestId}] GPT-Image-1 edits error:`, error.message);
    }
    return null;
  }

  async tryDallE3Fallback(style: string, size: string, quality: string, requestId: string): Promise<string | null> {
    try {
      console.log(`🔄 [${requestId}] Trying DALL-E-3 with detailed prompt...`);
      
      const detailedPrompt = `A dolphin in ${style} style. The image should show a dolphin with the artistic characteristics of ${style}. Maintain the dolphin as the main subject while applying the visual style transformation.`;
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: detailedPrompt,
          size: size === '1536x1024' ? '1792x1024' : size === '1024x1536' ? '1024x1792' : size,
          quality: quality === 'preview' ? 'standard' : 'hd',
          n: 1
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data[0]?.url) {
          console.log(`✅ [${requestId}] Success with DALL-E-3 fallback`);
          return result.data[0].url;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`⚠️ [${requestId}] DALL-E-3 failed:`, errorData.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.warn(`⚠️ [${requestId}] DALL-E-3 error:`, error.message);
    }
    return null;
  }
}
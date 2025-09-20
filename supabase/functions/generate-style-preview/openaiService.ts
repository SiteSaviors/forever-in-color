export class OpenAIService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async tryImageVariations(imageBlob: Blob, stylePrompt: string, size: string, requestId: string): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.jpg');
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
          return result.data[0].url;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`🔧 [DIAGNOSTIC] Image variations failed - Status: ${response.status}, Error:`, errorData);
      }
    } catch (error) {
      console.error(`🔧 [DIAGNOSTIC] Image variations exception:`, error);
    }
    return null;
  }

  async tryImageEdits(imageBlob: Blob, stylePrompt: string, size: string, requestId: string): Promise<string | null> {
    try {
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
          return result.data[0].url;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(`🔧 [DIAGNOSTIC] Image edits failed - Status: ${response.status}, Error:`, errorData);
      }
    } catch (error) {
      console.error(`🔧 [DIAGNOSTIC] Image edits exception:`, error);
    }
    return null;
  }

}
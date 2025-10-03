
export class ImageAnalysisService {
  constructor(private apiKey: string) {}

  async analyzeImage(imageData: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image and provide a detailed description of the main subject, including: facial features, expression, pose, clothing, age, gender, hair color/style, eye color, and any other distinguishing characteristics. Be very specific and detailed.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Image analysis failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const description = data.choices[0]?.message?.content;
      
      if (!description) {
        throw new Error('No description returned from image analysis');
      }


    return description;
  }
}

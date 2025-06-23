
import { ImageAnalysisService } from './imageAnalysisService.ts';
import { StylePromptService } from './stylePromptService.ts';
import { ImageGenerationService } from './imageGenerationService.ts';

export class OpenAIService {
  private imageAnalysisService: ImageAnalysisService;
  private stylePromptService: StylePromptService;
  private imageGenerationService: ImageGenerationService;

  constructor(private apiKey: string, private supabase: any) {
    this.imageAnalysisService = new ImageAnalysisService(apiKey);
    this.stylePromptService = new StylePromptService(supabase);
    this.imageGenerationService = new ImageGenerationService(apiKey);
  }

  async generateImageToImage(imageData: string, styleName: string): Promise<{ ok: boolean; output?: string; error?: string }> {
    try {
      // Get the exact prompt from Supabase
      const stylePrompt = await this.stylePromptService.getStylePrompt(styleName);
      
      if (!stylePrompt) {
        console.error('No style prompt found for:', styleName);
        return {
          ok: false,
          error: 'Style prompt not found'
        };
      }

      console.log('Using exact prompt for style:', styleName, '- Prompt:', stylePrompt);

      // Generate the image using the exact prompt
      return await this.imageGenerationService.generateImageToImage(imageData, stylePrompt);

    } catch (error) {
      console.error('OpenAI Service error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }
}

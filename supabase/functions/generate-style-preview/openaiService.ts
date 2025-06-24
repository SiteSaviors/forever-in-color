
import { ImageAnalysisService } from './imageAnalysisService.ts';
import { StylePromptService } from './stylePromptService.ts';
import { ReplicateService } from './replicateService.ts';

export class OpenAIService {
  private imageAnalysisService: ImageAnalysisService;
  private stylePromptService: StylePromptService;
  private replicateService: ReplicateService;

  constructor(private openaiApiKey: string, private replicateApiToken: string, private supabase: any) {
    this.imageAnalysisService = new ImageAnalysisService(openaiApiKey);
    this.stylePromptService = new StylePromptService(supabase);
    this.replicateService = new ReplicateService(replicateApiToken, openaiApiKey);
  }

  async generateImageToImage(imageData: string, styleName: string, aspectRatio: string = "1:1", quality: string = "medium"): Promise<{ ok: boolean; output?: string; error?: string }> {
    try {
      console.log('=== OPENAI SERVICE GENERATION ===');
      console.log('Received aspect ratio in OpenAI Service:', aspectRatio);
      console.log('Style name:', styleName);
      
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
      console.log('CRITICAL: Generating with aspect ratio:', aspectRatio);

      // Generate the image using Replicate's GPT-Image-1 model with specified aspect ratio
      console.log('Calling ReplicateService.generateImageToImage with aspect ratio:', aspectRatio);
      return await this.replicateService.generateImageToImage(imageData, stylePrompt, aspectRatio, quality);

    } catch (error) {
      console.error('OpenAI Service error:', error);
      return {
        ok: false,
        error: error.message
      };
    }
  }
}

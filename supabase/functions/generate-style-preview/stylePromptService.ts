import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export interface StylePromptMetadata {
  prompt: string | null;
  styleVersion: string;
  styleId: number;
}

export class StylePromptService {
  constructor(private supabase: SupabaseClient) {}

  async getStylePrompt(styleName: string): Promise<string | null> {
    const metadata = await this.getStylePromptWithMetadata(styleName);
    return metadata?.prompt ?? null;
  }

  async getStylePromptWithMetadata(styleName: string): Promise<StylePromptMetadata | null> {
    try {
      const styleId = this.resolveStyleId(styleName);
      
      const { data, error } = await this.supabase
        .from('style_prompts')
        .select('prompt, updated_at')
        .eq('style_id', styleId)
        .single();

      if (error) {
        return {
          prompt: null,
          styleVersion: '0',
          styleId
        };
      }

      const updatedAt = data?.updated_at as string | null;

      const styleVersion = updatedAt ? new Date(updatedAt).getTime().toString() : '0';

      return {
        prompt: data?.prompt ?? null,
        styleVersion,
        styleId
      };
    } catch (_error) {
      return {
        prompt: null,
        styleVersion: '0',
        styleId: this.resolveStyleId(styleName)
      };
    }
  }

  resolveStyleId(styleName: string): number {
    const styleNameToId: { [key: string]: number } = {
      'Original Image': 1,
      'Classic Oil Painting': 2,
      'Calm WaterColor': 3,
      'Watercolor Dreams': 4,
      'Pastel Bliss': 5,
      'Gemstone Poly': 6,
      '3D Storybook': 7,
      'Artisan Charcoal': 8,
      'Pop Art Burst': 9,
      'Neon Splash': 10,
      'Electric Bloom': 11,
      'Artistic Mashup': 12,
      'Abstract Fusion': 13,
      'Modern Abstract': 13,
      'Intricate Ink': 14,
      'Deco Luxe': 15
    };
    
    const styleId = styleNameToId[styleName];

    return styleId || 1;
  }
}

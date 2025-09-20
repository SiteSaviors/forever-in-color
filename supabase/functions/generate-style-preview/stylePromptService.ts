
export class StylePromptService {
  constructor(private supabase: any) {}

  async getStylePrompt(styleName: string): Promise<string | null> {
    try {
      const styleId = this.getStyleIdByName(styleName);
      
      // Fetch the prompt from Supabase style_prompts table
      const { data, error } = await this.supabase
        .from('style_prompts')
        .select('prompt')
        .eq('style_id', styleId)
        .single();

      if (error) {
        return null;
      }

      return data?.prompt || null;
    } catch (error) {
      return null;
    }
  }

  private getStyleIdByName(styleName: string): number {
    // Updated mapping to match the exact style names used in the frontend
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
      'Modern Abstract': 13, // Alternative name for Abstract Fusion
      'Intricate Ink': 14,
      'Deco Luxe': 15
    };
    
    const styleId = styleNameToId[styleName];
    
    return styleId || 1; // Default to Original Image if not found
  }
}

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import {
  EDGE_STYLE_BY_NAME,
  EDGE_STYLE_BY_SLUG,
  type EdgeStyleRegistryEntry,
} from '../_shared/styleRegistry.generated.ts';

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
    const entry = this.resolveRegistryEntry(styleName);
    if (entry.numericId == null) {
      throw new Error(`No numeric ID configured for style "${styleName}" (slug: ${entry.id})`);
    }
    return entry.numericId;
  }

  private resolveRegistryEntry(styleName: string): EdgeStyleRegistryEntry {
    const byName = EDGE_STYLE_BY_NAME.get(styleName);
    if (byName) {
      return byName;
    }

    const bySlug = EDGE_STYLE_BY_SLUG.get(styleName);
    if (bySlug) {
      return bySlug;
    }

    throw new Error(`Unknown style "${styleName}" - ensure registry and Supabase prompts are in sync.`);
  }
}

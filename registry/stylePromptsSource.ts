import prompts from '../docs/style_prompts_rows.json';

export type SupabaseStylePromptRow = {
  idx: number;
  id: string;
  style_id: number;
  prompt: string;
  created_at: string;
  updated_at: string;
};

/**
 * Canonical prompt rows exported from Supabase.
 * These rows are used during registry generation to attach prompt metadata to styles.
 */
export const SUPABASE_STYLE_PROMPTS: SupabaseStylePromptRow[] = prompts;

/**
 * Helper map for quick lookup by numeric style id.
 */
export const SUPABASE_PROMPTS_BY_ID = new Map<number, SupabaseStylePromptRow>(
  SUPABASE_STYLE_PROMPTS.map((row) => [row.style_id, row])
);

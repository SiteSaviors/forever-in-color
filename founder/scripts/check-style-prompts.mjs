#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const styles = [
  'classic-oil-painting',
  'watercolor-dreams',
  'pastel-bliss',
  '3d-storybook',
  'pop-art-burst',
  'artisan-charcoal',
  'neon-splash',
  'electric-bloom',
  'deco-luxe',
  'abstract-fusion',
  'gemstone-poly',
];

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

(async () => {
  const missing = [];
  for (const style of styles) {
    const { data, error } = await supabase
      .from('style_prompts')
      .select('style_name, style_id, style_version')
      .eq('style_name', style)
      .limit(1);

    if (error) {
      console.error(`Error querying ${style}:`, error.message);
      process.exitCode = 1;
      continue;
    }

    if (!data || data.length === 0) {
      missing.push(style);
      continue;
    }

    const { style_id, style_version } = data[0];
    console.info(`✓ ${style} → id=${style_id} version=${style_version}`);
  }

  if (missing.length) {
    console.warn('\nMissing prompt entries for:', missing.join(', '));
  } else {
    console.info('\nAll founder styles have prompt entries.');
  }
})();

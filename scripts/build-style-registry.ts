#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STYLE_REGISTRY_SOURCE, type StyleRegistrySourceEntry } from '../registry/styleRegistrySource';
import { SUPABASE_PROMPTS_BY_ID } from '../registry/stylePromptsSource';

type GeneratedPrompt = {
  numericId: number;
  prompt: string;
  updatedAt: string;
};

const normalizeAssetPath = (assetPath: string): string => assetPath.replace(/^\/+/, '');

const getAssetVariant = (assetPath: string, extension: string): string | null => {
  const normalized = normalizeAssetPath(assetPath);
  const parsed = path.parse(normalized);
  const candidateRelative = path.join(parsed.dir, `${parsed.name}${extension}`).replace(/\\/g, '/');
  const candidateAbsolute = path.resolve(projectRoot, 'public', candidateRelative);
  if (fs.existsSync(candidateAbsolute)) {
    return `/${candidateRelative}`;
  }
  return null;
};

type GeneratedEntry = {
  id: string;
  slug: string;
  name: string;
  tone: StyleRegistrySourceEntry['tone'];
  tier: StyleRegistrySourceEntry['tier'];
  category: NonNullable<StyleRegistrySourceEntry['category']>;
  isPremium: boolean;
  defaultUnlocked: boolean;
  priceModifier: number;
  description: string;
  marketingCopy?: string | null;
  badges: string[];
  requiredTier?: 'creator' | 'plus' | 'pro';
  sortOrder: number;
  assets: StyleRegistrySourceEntry['assets'] & {
    thumbnailWebp?: string | null;
    thumbnailAvif?: string | null;
    previewWebp?: string | null;
    previewAvif?: string | null;
  };
  featureFlags: {
    isEnabled: boolean;
    rolloutPercentage: number;
    disabledReason?: string | null;
  };
  prompt?: GeneratedPrompt;
  story: StyleRegistrySourceEntry['story'] | null;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const uiOutputPath = path.resolve(projectRoot, 'src/config/styles/styleRegistry.generated.ts');
const edgeOutputPath = path.resolve(
  projectRoot,
  'supabase/functions/_shared/styleRegistry.generated.ts'
);

const ensureAssetExists = (styleId: string, assetPath: string, type: string) => {
  const normalized = normalizeAssetPath(assetPath);
  const absolutePath = path.resolve(projectRoot, 'public', normalized);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Missing ${type} asset for style "${styleId}". Expected file at public/${normalized}`
    );
  }
};

const generatedEntries = STYLE_REGISTRY_SOURCE.map<GeneratedEntry>((source, index) => {
  const badges = source.badges ?? [];

  const featureFlags = {
    isEnabled: source.featureFlags?.isEnabled ?? true,
    rolloutPercentage: source.featureFlags?.rolloutPercentage ?? 100,
    disabledReason: source.featureFlags?.disabledReason ?? null,
  };

  const sortOrder = source.sortOrder ?? index * 10;
  const category = source.category ?? 'style';

  let prompt: GeneratedPrompt | undefined;
  const thumbnailWebp = getAssetVariant(source.assets.thumbnail, '.webp');
  const thumbnailAvif = getAssetVariant(source.assets.thumbnail, '.avif');
  const previewWebp = getAssetVariant(source.assets.preview, '.webp');
  const previewAvif = getAssetVariant(source.assets.preview, '.avif');

  if (typeof source.numericId === 'number') {
    const promptRow = SUPABASE_PROMPTS_BY_ID.get(source.numericId);
    if (!promptRow) {
      throw new Error(
        `Missing Supabase prompt for style "${source.id}" (numericId: ${source.numericId}). ` +
          'Update docs/style_prompts_rows.json before regenerating the registry.'
      );
    }
    prompt = {
      numericId: source.numericId,
      prompt: promptRow.prompt,
      updatedAt: promptRow.updated_at,
    };
  }

  if (featureFlags.rolloutPercentage < 0 || featureFlags.rolloutPercentage > 100) {
    throw new Error(
      `Invalid rollout percentage for style "${source.id}". Expected 0-100, received ${featureFlags.rolloutPercentage}`
    );
  }

  return {
    id: source.id,
    slug: source.id,
    name: source.name,
    tone: source.tone ?? null,
    tier: source.tier,
    category,
    isPremium: source.isPremium,
    defaultUnlocked: source.defaultUnlocked,
    priceModifier: source.priceModifier,
    description: source.description,
    marketingCopy: source.marketingCopy ?? null,
    badges,
    requiredTier: source.requiredTier,
    sortOrder,
    assets: {
      thumbnail: source.assets.thumbnail,
      preview: source.assets.preview,
      thumbnailWebp,
      thumbnailAvif,
      previewWebp,
      previewAvif,
    },
    featureFlags,
    prompt,
    story: source.story ?? null,
  };
});

STYLE_REGISTRY_SOURCE.forEach((source) => {
  const validation = source.assetValidation ?? {};
  if (validation.thumbnail !== false) {
    ensureAssetExists(source.id, source.assets.thumbnail, 'thumbnail');
  }
  if (validation.preview !== false) {
    ensureAssetExists(source.id, source.assets.preview, 'preview');
  }
});

const serializePrompt = (prompt: GeneratedPrompt): string => {
  const lines = [
    '{',
    `    numericId: ${prompt.numericId},`,
    `    prompt: ${JSON.stringify(prompt.prompt)},`,
    `    updatedAt: ${JSON.stringify(prompt.updatedAt)},`,
    '  }',
  ];
  return lines.join('\n');
};

const serializeEntry = (entry: GeneratedEntry): string => {
  const lines: string[] = ['{'];
  lines.push(`  id: ${JSON.stringify(entry.id)},`);
  lines.push(`  slug: ${JSON.stringify(entry.slug)},`);
  lines.push(`  name: ${JSON.stringify(entry.name)},`);
  lines.push(`  tone: ${entry.tone === null ? 'null' : JSON.stringify(entry.tone)},`);
  lines.push(`  tier: ${JSON.stringify(entry.tier)},`);
  lines.push(`  category: ${JSON.stringify(entry.category)},`);
  lines.push(`  isPremium: ${entry.isPremium},`);
  lines.push(`  defaultUnlocked: ${entry.defaultUnlocked},`);
  lines.push(`  priceModifier: ${entry.priceModifier},`);
  lines.push(`  description: ${JSON.stringify(entry.description)},`);
  if (entry.marketingCopy != null) {
    lines.push(`  marketingCopy: ${JSON.stringify(entry.marketingCopy)},`);
  } else {
    lines.push('  marketingCopy: null,');
  }
  lines.push(`  badges: ${JSON.stringify(entry.badges)},`);
  if (entry.requiredTier) {
    lines.push(`  requiredTier: ${JSON.stringify(entry.requiredTier)},`);
  }
  lines.push(`  sortOrder: ${entry.sortOrder},`);
  lines.push('  assets: {');
  lines.push(`    thumbnail: ${JSON.stringify(entry.assets.thumbnail)},`);
  if (entry.assets.thumbnailWebp) {
    lines.push(`    thumbnailWebp: ${JSON.stringify(entry.assets.thumbnailWebp)},`);
  } else {
    lines.push('    thumbnailWebp: null,');
  }
  if (entry.assets.thumbnailAvif) {
    lines.push(`    thumbnailAvif: ${JSON.stringify(entry.assets.thumbnailAvif)},`);
  } else {
    lines.push('    thumbnailAvif: null,');
  }
  lines.push(`    preview: ${JSON.stringify(entry.assets.preview)},`);
  if (entry.assets.previewWebp) {
    lines.push(`    previewWebp: ${JSON.stringify(entry.assets.previewWebp)},`);
  } else {
    lines.push('    previewWebp: null,');
  }
  if (entry.assets.previewAvif) {
    lines.push(`    previewAvif: ${JSON.stringify(entry.assets.previewAvif)},`);
  } else {
    lines.push('    previewAvif: null,');
  }
  lines.push('  },');
  lines.push('  featureFlags: {');
  lines.push(`    isEnabled: ${entry.featureFlags.isEnabled},`);
  lines.push(`    rolloutPercentage: ${entry.featureFlags.rolloutPercentage},`);
  if (entry.featureFlags.disabledReason) {
    lines.push(`    disabledReason: ${JSON.stringify(entry.featureFlags.disabledReason)},`);
  } else {
    lines.push('    disabledReason: null,');
  }
  lines.push('  },');
  if (entry.prompt) {
    lines.push(`  prompt: ${serializePrompt(entry.prompt)},`);
  }
  if (entry.story) {
    const story = JSON.stringify(entry.story, null, 2).replace(/\n/g, '\n  ');
    lines.push(`  story: ${story},`);
  } else {
    lines.push('  story: null,');
  }
  lines.push('}');
  return lines.join('\n');
};

const serializedEntries = generatedEntries.map(serializeEntry).join(',\n');

const fileHeader = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n// Run \`npm run build:registry\` to regenerate.\n\nimport type { StyleRegistryEntry } from './types';\n\n`;

const body = `export const STYLE_REGISTRY: StyleRegistryEntry[] = [\n${serializedEntries}\n];\n\nexport const STYLE_REGISTRY_BY_ID = new Map(STYLE_REGISTRY.map((style) => [style.id, style]));\n\nexport const STYLE_REGISTRY_BY_NUMERIC_ID = new Map(\n  STYLE_REGISTRY.filter((style) => style.prompt).map((style) => [style.prompt!.numericId, style])\n);\n`;

const uiContent = `${fileHeader}${body}`;

fs.mkdirSync(path.dirname(uiOutputPath), { recursive: true });
fs.writeFileSync(uiOutputPath, uiContent);

console.log(`✅ Generated ${path.relative(projectRoot, uiOutputPath)}`);

type EdgeEntry = {
  id: string;
  name: string;
  numericId: number | null;
  tone: GeneratedEntry['tone'];
  tier: GeneratedEntry['tier'];
  prompt: GeneratedPrompt | null;
};

const edgeEntries: EdgeEntry[] = generatedEntries.map((entry) => ({
  id: entry.id,
  name: entry.name,
  numericId: entry.prompt?.numericId ?? null,
  tone: entry.tone,
  tier: entry.tier,
  prompt: entry.prompt ?? null,
}));

const serializeEdgePrompt = (prompt: GeneratedPrompt | null): string => {
  if (!prompt) {
    return 'null';
  }
  return [
    '{',
    `    numericId: ${prompt.numericId},`,
    `    prompt: ${JSON.stringify(prompt.prompt)},`,
    `    updatedAt: ${JSON.stringify(prompt.updatedAt)},`,
    '  }',
  ].join('\n');
};

const serializeEdgeEntry = (entry: EdgeEntry): string => {
  const lines: string[] = ['{'];
  lines.push(`  id: ${JSON.stringify(entry.id)},`);
  lines.push(`  name: ${JSON.stringify(entry.name)},`);
  lines.push(`  numericId: ${entry.numericId === null ? 'null' : entry.numericId},`);
  lines.push(`  tone: ${entry.tone === null ? 'null' : JSON.stringify(entry.tone)},`);
  lines.push(`  tier: ${JSON.stringify(entry.tier)},`);
  lines.push(`  prompt: ${serializeEdgePrompt(entry.prompt)},`);
  lines.push('}');
  return lines.join('\n');
};

const serializedEdgeEntries = edgeEntries.map(serializeEdgeEntry).join(',\n');

const edgeHeader = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n// Run \`npm run build:registry\` to regenerate.\n\nexport type EdgeStyleRegistryEntry = {\n  id: string;\n  name: string;\n  numericId: number | null;\n  tone: ${`'trending' | 'classic' | 'modern' | 'abstract' | 'stylized' | 'electric' | 'signature' | null`};\n  tier: 'free' | 'premium';\n  prompt: {\n    numericId: number;\n    prompt: string;\n    updatedAt: string;\n  } | null;\n};\n\n`;

const edgeBody = `export const EDGE_STYLE_REGISTRY: EdgeStyleRegistryEntry[] = [\n${serializedEdgeEntries}\n];\n\nexport const EDGE_STYLE_BY_NAME = new Map(\n  EDGE_STYLE_REGISTRY.map((style) => [style.name, style])\n);\n\nexport const EDGE_STYLE_BY_SLUG = new Map(\n  EDGE_STYLE_REGISTRY.map((style) => [style.id, style])\n);\n\nexport const EDGE_STYLE_BY_ID = new Map(\n  EDGE_STYLE_REGISTRY.filter((style) => style.numericId !== null).map((style) => [style.numericId as number, style])\n);\n`;

const edgeContent = `${edgeHeader}${edgeBody}`;

fs.mkdirSync(path.dirname(edgeOutputPath), { recursive: true });
fs.writeFileSync(edgeOutputPath, edgeContent);

console.log(`✅ Generated ${path.relative(projectRoot, edgeOutputPath)}`);

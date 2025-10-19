export type StyleTone =
  | 'trending'
  | 'classic'
  | 'modern'
  | 'abstract'
  | 'stylized'
  | 'electric'
  | 'signature';

export type StyleTier = 'free' | 'premium';

export type StyleCategory = 'style' | 'original';

export type StyleFeatureFlags = {
  isEnabled: boolean;
  rolloutPercentage: number;
  disabledReason?: string | null;
};

export type StyleAssetConfig = {
  thumbnail: string;
  preview: string;
  thumbnailWebp?: string | null;
  previewWebp?: string | null;
};

export type StylePromptMetadata = {
  numericId: number;
  prompt: string;
  updatedAt: string;
};

export type StyleRegistryEntry = {
  id: string;
  slug: string;
  name: string;
  tone: StyleTone | null;
  tier: StyleTier;
  category: StyleCategory;
  isPremium: boolean;
  defaultUnlocked: boolean;
  priceModifier: number;
  description: string;
  marketingCopy?: string | null;
  badges: string[];
  requiredTier?: 'creator' | 'plus' | 'pro';
  sortOrder: number;
  assets: StyleAssetConfig;
  featureFlags: StyleFeatureFlags;
  prompt?: StylePromptMetadata;
};

export type StyleToneDefinition = {
  id: StyleTone;
  label: string;
  description: string;
  icon?: string;
  sortOrder: number;
  requiredTier?: 'creator' | 'plus' | 'pro';
};

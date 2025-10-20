/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// types/images.ts

export interface ImageVariant {
  filename: string;
  size: number;
  savings?: number;
}

export interface ImageFormats {
  original: {
    filename: string;
    size: number;
    width: number;
    height: number;
    format: 'jpeg' | 'jpg' | 'png';
  };
  variants: {
    webp?: ImageVariant;
    avif?: ImageVariant;
  };
}

export interface ImageManifest {
  timestamp: string;
  images: Record<string, ImageFormats>;
  stats: {
    totalOriginalSize: number;
    totalOptimizedSize: number;
    savings: {
      bytes: number;
      percentage: number;
    };
  };
}

// types/style.ts - Updated style registry types

export interface StyleImage {
  src: string;           // Original JPEG path
  webp?: string;         // WebP variant path
  avif?: string;         // AVIF variant path
  alt: string;
  width?: number;
  height?: number;
}

export interface Style {
  id: string;
  name: string;
  tone: ToneType;
  description: string;
  image: StyleImage;      // Updated to use new type
  isPremium: boolean;
  popularityRank?: number;
}

// scripts/generate-registry.ts - Updated registry generator

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import type { ImageManifest, Style } from '../types';

const MANIFEST_PATH = '../public/styles/image-manifest.json';
const OUTPUT_PATH = '../src/data/styleRegistry.ts';

interface StyleConfig {
  id: string;
  name: string;
  tone: string;
  description: string;
  imageBase: string;  // Base name without extension
  isPremium: boolean;
  popularityRank?: number;
}

// Your existing style configurations
const STYLES: StyleConfig[] = [
  {
    id: 'abstract-fusion',
    name: 'Abstract Fusion',
    tone: 'modern',
    description: 'Bold geometric patterns',
    imageBase: 'abstract-fusion',
    isPremium: false,
    popularityRank: 1
  },
  {
    id: '3d-storybook',
    name: '3D Storybook',
    tone: 'modern',
    description: 'Whimsical 3D illustrated style',
    imageBase: '3d-storybook',
    isPremium: true,
    popularityRank: 2
  },
  // ... more styles
];

function generateRegistry() {
  console.log('🔧 Generating style registry with optimized images...\n');
  
  // Load image manifest if it exists
  let manifest: ImageManifest | null = null;
  
  if (existsSync(MANIFEST_PATH)) {
    try {
      manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
      console.log('✅ Loaded image manifest with optimized variants\n');
    } catch (error) {
      console.warn('⚠️ Could not load image manifest, using original images only\n');
    }
  }
  
  // Generate styles with image variants
  const styles: Style[] = STYLES.map(config => {
    const imageData = manifest?.images[config.imageBase];
    
    // Build image object with variants if available
    const image: StyleImage = {
      src: `/styles/${config.imageBase}.jpg`,
      alt: `${config.name} style preview`,
    };
    
    if (imageData) {
      // Add optimized variants if they exist
      if (imageData.variants.webp) {
        image.webp = `/styles/${imageData.variants.webp.filename}`;
      }
      if (imageData.variants.avif) {
        image.avif = `/styles/${imageData.variants.avif.filename}`;
      }
      // Add dimensions for better loading experience
      image.width = imageData.original.width;
      image.height = imageData.original.height;
    }
    
    return {
      id: config.id,
      name: config.name,
      tone: config.tone as any,
      description: config.description,
      image,
      isPremium: config.isPremium,
      popularityRank: config.popularityRank,
    };
  });
  
  // Generate TypeScript file
  const output = `// Auto-generated style registry - DO NOT EDIT MANUALLY
// Generated: ${new Date().toISOString()}
// Image optimization: ${manifest ? 'Enabled' : 'Disabled'}

import type { Style } from '@/types';

export const styleRegistry: Style[] = ${JSON.stringify(styles, null, 2)};

export const styleById = new Map(
  styleRegistry.map(style => [style.id, style])
);

export const stylesByTone = styleRegistry.reduce((acc, style) => {
  if (!acc[style.tone]) acc[style.tone] = [];
  acc[style.tone].push(style);
  return acc;
}, {} as Record<string, Style[]>);

// Image optimization stats
export const imageStats = ${manifest ? JSON.stringify(manifest.stats, null, 2) : 'null'};
`;
  
  writeFileSync(OUTPUT_PATH, output);
  
  console.log(`✅ Registry generated with ${styles.length} styles`);
  if (manifest) {
    console.log(`📊 Image savings: ${manifest.stats.savings.percentage}% reduction`);
  }
}

generateRegistry();

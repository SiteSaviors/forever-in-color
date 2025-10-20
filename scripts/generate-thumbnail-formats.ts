#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

type VariantConfig = {
  extension: string;
  mediaType: string;
  options: sharp.SharpOptions | sharp.WebpOptions | sharp.AvifOptions;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const THUMBNAIL_DIR = path.join(ROOT_DIR, 'public', 'art-style-thumbnails');

const VARIANTS: VariantConfig[] = [
  {
    extension: '.webp',
    mediaType: 'image/webp',
    options: { quality: 82 },
  },
  {
    extension: '.avif',
    mediaType: 'image/avif',
    options: { quality: 45 },
  },
];

const ensureDirectory = async (target: string) => {
  await fs.mkdir(target, { recursive: true });
};

const convertImage = async (inputPath: string, outputPath: string, variant: VariantConfig) => {
  try {
    await fs.access(outputPath);
    return;
  } catch {
    // file does not exist – continue
  }

  const transformer = sharp(inputPath);

  if (variant.extension === '.webp') {
    await transformer.webp(variant.options as sharp.WebpOptions).toFile(outputPath);
    return;
  }

  if (variant.extension === '.avif') {
    await transformer.avif(variant.options as sharp.AvifOptions).toFile(outputPath);
    return;
  }

  throw new Error(`Unsupported variant extension: ${variant.extension}`);
};

const run = async () => {
  await ensureDirectory(THUMBNAIL_DIR);

  const entries = await fs.readdir(THUMBNAIL_DIR, { withFileTypes: true });
  const sourceFiles = entries
    .filter((entry) => entry.isFile() && /\.(jpe?g)$/i.test(entry.name))
    .map((entry) => path.join(THUMBNAIL_DIR, entry.name));

  if (sourceFiles.length === 0) {
    console.info('[thumbnail:generate] No JPEG thumbnails detected – skipping.');
    return;
  }

  for (const file of sourceFiles) {
    const { name } = path.parse(file);
    for (const variant of VARIANTS) {
      const outputName = `${name}${variant.extension}`;
      const outputPath = path.join(THUMBNAIL_DIR, outputName);
      await convertImage(file, outputPath, variant);
      console.info(`[thumbnail:generate] ensured ${outputName}`);
    }
  }

  console.info('[thumbnail:generate] Completed thumbnail variant generation.');
};

run().catch((error) => {
  console.error('[thumbnail:generate] Failed to generate variants', error);
  process.exitCode = 1;
});

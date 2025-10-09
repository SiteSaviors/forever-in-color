import { Orientation } from '@/utils/imageUtils';

type OrientationMeta = {
  label: string;
  ratio: number;
  description: string;
};

export const ORIENTATION_PRESETS: Record<Orientation, OrientationMeta> = {
  square: {
    label: 'Square',
    ratio: 1,
    description: 'Balanced composition perfect for symmetry and social showcases.',
  },
  vertical: {
    label: 'Portrait',
    ratio: 2 / 3,
    description: 'Tailored to people photography and mobile-first storytelling.',
  },
  horizontal: {
    label: 'Landscape',
    ratio: 3 / 2,
    description: 'Wide framing that amplifies scenery and group moments.',
  },
};

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DetectionResult {
  region: CropRegion;
  confidence: number;
  hasFace: boolean;
}

export interface SmartCropResult {
  orientation: Orientation;
  dataUrl: string;
  region: CropRegion;
  imageDimensions: { width: number; height: number };
  generatedAt: number;
  generatedBy: 'smart' | 'manual';
}

const BLOCK_SIZE = 16; // Reduced from 32 for 4x more precision in subject detection
const MIN_RESOLUTION = 2000; // Maintain at least 2000px on long edge

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const analyzeImageForSubject = (image: HTMLImageElement): DetectionResult => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const size = Math.min(image.width, image.height) * 0.8;
    return {
      region: {
        x: (image.width - size) / 2,
        y: (image.height - size) / 2,
        width: size,
        height: size,
      },
      confidence: 0.5,
      hasFace: false,
    };
  }

  // Downsample to max 1000px for analysis (5x+ speedup)
  const MAX_ANALYSIS_SIZE = 1000;
  const scale = Math.min(1, MAX_ANALYSIS_SIZE / Math.max(image.width, image.height));
  const analysisWidth = Math.round(image.width * scale);
  const analysisHeight = Math.round(image.height * scale);

  canvas.width = analysisWidth;
  canvas.height = analysisHeight;

  // High-quality downsampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, analysisWidth, analysisHeight);

  const imageData = ctx.getImageData(0, 0, analysisWidth, analysisHeight);
  const data = imageData.data;
  const blocksX = Math.ceil(analysisWidth / BLOCK_SIZE);
  const blocksY = Math.ceil(analysisHeight / BLOCK_SIZE);

  // Multi-peak analysis: find top 3 candidate regions
  const candidates: Array<{ x: number; y: number; score: number; hasFace: boolean }> = [];

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const saliency = calculateBlockSaliency(data, analysisWidth, analysisHeight, bx, by);
      const faceScore = detectFaceFeatures(data, analysisWidth, analysisHeight, bx, by);
      const centerBias = calculateCenterBias(bx, by, blocksX, blocksY);

      // Combined score: saliency + face detection + center bias
      const score = saliency * 0.5 + faceScore * 0.4 + centerBias * 0.1;
      const hasFace = faceScore > 0.3;

      candidates.push({ x: bx * BLOCK_SIZE, y: by * BLOCK_SIZE, score, hasFace });
    }
  }

  // Sort by score and pick the best
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  if (best && best.score > 0.2) {
    // Adaptive region size based on detection quality (as % of analyzed image)
    const regionSizePercent = best.hasFace ? 0.25 : 0.20; // 20-25% of image
    const regionSizeInAnalysis = Math.min(analysisWidth, analysisHeight) * regionSizePercent;

    // Scale region back to original image dimensions
    const scaleUpFactor = 1 / scale;
    return {
      region: {
        x: Math.max(0, (best.x - BLOCK_SIZE) * scaleUpFactor),
        y: Math.max(0, (best.y - BLOCK_SIZE) * scaleUpFactor),
        width: Math.min(image.width - best.x * scaleUpFactor, regionSizeInAnalysis * scaleUpFactor),
        height: Math.min(image.height - best.y * scaleUpFactor, regionSizeInAnalysis * scaleUpFactor),
      },
      confidence: Math.min(1, best.score),
      hasFace: best.hasFace,
    };
  }

  // Fallback: rule of thirds center crop (already in original dimensions)
  const size = Math.min(image.width, image.height) * 0.8;
  return {
    region: {
      x: (image.width - size) / 2,
      y: (image.height - size) / 2,
      width: size,
      height: size,
    },
    confidence: 0.5,
    hasFace: false,
  };
};

const calculateBlockSaliency = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  bx: number,
  by: number
): number => {
  const startX = bx * BLOCK_SIZE;
  const startY = by * BLOCK_SIZE;
  const endX = Math.min(startX + BLOCK_SIZE, width);
  const endY = Math.min(startY + BLOCK_SIZE, height);

  let variance = 0;
  let count = 0;

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      const neighbors = gatherNeighbors(data, width, height, x, y);
      const diff = neighbors.reduce((total, neighbor) => {
        const dr = Math.abs(r - neighbor.r);
        const dg = Math.abs(g - neighbor.g);
        const db = Math.abs(b - neighbor.b);
        return total + dr + dg + db;
      }, 0);

      variance += neighbors.length ? diff / neighbors.length : 0;
      count++;
    }
  }

  return count ? variance / count / 765 : 0;
};

const gatherNeighbors = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
) => {
  const neighbors: Array<{ r: number; g: number; b: number }> = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const idx = (ny * width + nx) * 4;
      neighbors.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
      });
    }
  }

  return neighbors;
};

// Detect face-like features using skin tone and contrast heuristics
const detectFaceFeatures = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  bx: number,
  by: number
): number => {
  const startX = bx * BLOCK_SIZE;
  const startY = by * BLOCK_SIZE;
  const endX = Math.min(startX + BLOCK_SIZE, width);
  const endY = Math.min(startY + BLOCK_SIZE, height);

  let skinTonePixels = 0;
  let totalPixels = 0;
  let highContrastEdges = 0;

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      totalPixels++;

      // Skin tone detection (HSV heuristics)
      // Skin tones typically have: high R, medium G, low B
      // And R > G > B with specific ratios
      const isSkinTone =
        r > 95 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        g > b &&
        Math.abs(r - g) > 15 &&
        r - b > 15;

      if (isSkinTone) {
        skinTonePixels++;
      }

      // Edge detection (simple Sobel-like check for eyes/nose contrast)
      if (x < endX - 1 && y < endY - 1) {
        const nextIndex = (y * width + (x + 1)) * 4;
        const belowIndex = ((y + 1) * width + x) * 4;

        const horizGradient =
          Math.abs(r - data[nextIndex]) +
          Math.abs(g - data[nextIndex + 1]) +
          Math.abs(b - data[nextIndex + 2]);

        const vertGradient =
          Math.abs(r - data[belowIndex]) +
          Math.abs(g - data[belowIndex + 1]) +
          Math.abs(b - data[belowIndex + 2]);

        if (horizGradient > 100 || vertGradient > 100) {
          highContrastEdges++;
        }
      }
    }
  }

  const skinRatio = skinTonePixels / totalPixels;
  const edgeRatio = highContrastEdges / totalPixels;

  // Faces typically have 20-60% skin tones and moderate edges (eyes, nose, mouth)
  const faceScore =
    skinRatio > 0.2 && skinRatio < 0.6 && edgeRatio > 0.1 && edgeRatio < 0.4
      ? skinRatio * edgeRatio * 2
      : 0;

  return faceScore;
};

// Calculate bias toward center (rule of thirds)
const calculateCenterBias = (
  bx: number,
  by: number,
  blocksX: number,
  blocksY: number
): number => {
  // Normalize to 0-1 range
  const normalizedX = bx / blocksX;
  const normalizedY = by / blocksY;

  // Rule of thirds: prefer regions around 1/3 and 2/3 positions
  const distanceFromThirdX = Math.min(
    Math.abs(normalizedX - 1 / 3),
    Math.abs(normalizedX - 2 / 3)
  );
  const distanceFromThirdY = Math.min(
    Math.abs(normalizedY - 1 / 3),
    Math.abs(normalizedY - 2 / 3)
  );

  // Gaussian-like falloff from ideal positions
  const biasX = Math.exp(-distanceFromThirdX * 5);
  const biasY = Math.exp(-distanceFromThirdY * 5);

  return (biasX + biasY) / 2;
};

const expandToAspect = (
  region: CropRegion,
  imageWidth: number,
  imageHeight: number,
  orientation: Orientation
): CropRegion => {
  const { ratio } = ORIENTATION_PRESETS[orientation];
  const centerX = region.x + region.width / 2;
  const centerY = region.y + region.height / 2;

  let newWidth = region.width;
  let newHeight = region.height;

  // Adaptive expansion based on image size (gentler to avoid over-zooming)
  const imageSize = Math.max(imageWidth, imageHeight);
  const expansionFactor = imageSize < 1000 ? 1.5 : imageSize > 2000 ? 1.8 : 1.6;

  if (orientation === 'square') {
    // For square, preserve detected subject center instead of forcing center crop
    const targetSize = Math.min(
      Math.max(region.width, region.height) * expansionFactor,
      Math.min(imageWidth, imageHeight) * 0.95
    );
    newWidth = targetSize;
    newHeight = targetSize;
  } else if (orientation === 'vertical') {
    // Portrait: expand height intelligently
    const minHeight = Math.max(region.height * expansionFactor, BLOCK_SIZE * 8);
    newHeight = Math.min(imageHeight * 0.95, minHeight);
    newWidth = newHeight * ratio;

    // Ensure we don't exceed image bounds
    if (newWidth > imageWidth * 0.95) {
      newWidth = imageWidth * 0.95;
      newHeight = newWidth / ratio;
    }
  } else {
    // Landscape: expand height first so we don't over-zoom on wide subjects
    const minHeight = Math.max(region.height * expansionFactor, imageHeight * 0.65, BLOCK_SIZE * 8);
    newHeight = Math.min(imageHeight * 0.9, minHeight);
    newWidth = newHeight * ratio;

    // If the computed width exceeds bounds, clamp and recalc height
    if (newWidth > imageWidth * 0.95) {
      newWidth = imageWidth * 0.95;
      newHeight = newWidth / ratio;
    }
  }

  // Position the crop centered on the detected subject
  let x = centerX - newWidth / 2;
  let y = centerY - newHeight / 2;

  // Boundary-aware adjustment: don't expand into blank space
  x = Math.max(0, Math.min(x, imageWidth - newWidth));
  y = Math.max(0, Math.min(y, imageHeight - newHeight));

  return { x, y, width: newWidth, height: newHeight };
};

const applyCrop = async (image: HTMLImageElement, region: CropRegion): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return image.src;

  // Maintain resolution: ensure output is at least MIN_RESOLUTION on long edge
  const longEdge = Math.max(region.width, region.height);
  const scaleFactor = longEdge < MIN_RESOLUTION ? MIN_RESOLUTION / longEdge : 1;

  const outputWidth = Math.round(region.width * scaleFactor);
  const outputHeight = Math.round(region.height * scaleFactor);

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  // High-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  // Use PNG for lossless intermediate storage
  return canvas.toDataURL('image/png');
};

type OrientationRecord<T> = Partial<Record<Orientation, T>>;

const smartCropResultCache = new Map<string, OrientationRecord<SmartCropResult>>();
const smartCropInFlightCache = new Map<string, OrientationRecord<Promise<SmartCropResult>>>();

const ensureRecord = <T>(collection: Map<string, OrientationRecord<T>>, key: string): OrientationRecord<T> => {
  let record = collection.get(key);
  if (!record) {
    record = {};
    collection.set(key, record);
  }
  return record;
};

const deleteRecordValue = <T>(collection: Map<string, OrientationRecord<T>>, key: string, orientation: Orientation) => {
  const record = collection.get(key);
  if (!record) return;
  delete record[orientation];
  if (Object.keys(record).length === 0) {
    collection.delete(key);
  }
};

export const cacheSmartCropResult = (imageUrl: string, orientation: Orientation, result: SmartCropResult) => {
  const record = ensureRecord(smartCropResultCache, imageUrl);
  record[orientation] = result;
};

export const getCachedSmartCropResult = (imageUrl: string, orientation: Orientation): SmartCropResult | undefined => {
  return smartCropResultCache.get(imageUrl)?.[orientation];
};

export const clearSmartCropCacheForImage = (imageUrl: string) => {
  smartCropResultCache.delete(imageUrl);
  smartCropInFlightCache.delete(imageUrl);
};

export const generateSmartCrop = async (
  imageUrl: string,
  orientation: Orientation
): Promise<SmartCropResult> => {
  const cachedResult = getCachedSmartCropResult(imageUrl, orientation);
  if (cachedResult) {
    return cachedResult;
  }

  const inFlightRecord = smartCropInFlightCache.get(imageUrl);
  const inFlightPromise = inFlightRecord?.[orientation];
  if (inFlightPromise) {
    return inFlightPromise;
  }

  const startTime = performance.now();

  const promise = (async () => {
    try {
      const image = await loadImage(imageUrl);
      const analysisStart = performance.now();
      const detection = analyzeImageForSubject(image);
      const analysisTime = performance.now() - analysisStart;

      const region = expandToAspect(detection.region, image.width, image.height, orientation);
      const result = await applyCrop(image, region);

      const totalTime = performance.now() - startTime;
      console.log(
        `[SmartCrop] ${orientation} | ${image.width}x${image.height} | ` +
        `analysis: ${analysisTime.toFixed(0)}ms | total: ${totalTime.toFixed(0)}ms | ` +
        `confidence: ${(detection.confidence * 100).toFixed(0)}% | face: ${detection.hasFace}`
      );

      const payload: SmartCropResult = {
        orientation,
        dataUrl: result,
        region,
        imageDimensions: { width: image.width, height: image.height },
        generatedAt: Date.now(),
        generatedBy: 'smart',
      };

      cacheSmartCropResult(imageUrl, orientation, payload);
      return payload;
    } catch (error) {
      const failTime = performance.now() - startTime;
      console.error(`[SmartCrop] Failed after ${failTime.toFixed(0)}ms:`, error);
      let fallbackDimensions = { width: 0, height: 0 };
      try {
        const fallbackImage = await loadImage(imageUrl);
        fallbackDimensions = { width: fallbackImage.width, height: fallbackImage.height };
      } catch {
        // ignore secondary failure
      }

      const fallback: SmartCropResult = {
        orientation,
        dataUrl: imageUrl,
        region: {
          x: 0,
          y: 0,
          width: fallbackDimensions.width,
          height: fallbackDimensions.height,
        },
        imageDimensions: fallbackDimensions,
        generatedAt: Date.now(),
        generatedBy: 'smart',
      };
      cacheSmartCropResult(imageUrl, orientation, fallback);
      return fallback;
    }
  })();

  const record = ensureRecord(smartCropInFlightCache, imageUrl);
  record[orientation] = promise;

  promise.finally(() => {
    deleteRecordValue(smartCropInFlightCache, imageUrl, orientation);
  });

  return promise;
};

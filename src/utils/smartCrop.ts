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

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

type DetectionMethod = 'saliency' | 'center-fallback';

interface DetectionResult {
  region: CropRegion;
  confidence: number;
  method: DetectionMethod;
}

export interface SmartCropDebugInfo {
  detectionMethod: DetectionMethod;
  detectionConfidence: number;
  subjectRegion: CropRegion;
  expandedRegion: CropRegion;
}

export interface SmartCropResult {
  orientation: Orientation;
  dataUrl: string;
  region: CropRegion;
  imageDimensions: { width: number; height: number };
  generatedAt: number;
  generatedBy: 'smart' | 'manual';
  debugInfo?: SmartCropDebugInfo;
}

const BLOCK_SIZE = 32;
const SALIENCY_THRESHOLD = 0.3;

const detectSubjectRegion = async (imageUrl: string): Promise<DetectionResult> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) {
        resolve(getCenterFallback(img.width, img.height));
        return;
      }

      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const detected = analyzeImageForSubject(imageData, img.width, img.height);
        resolve(detected);
      } catch (_error) {
        resolve(getCenterFallback(img.width, img.height));
      }
    };

    img.onerror = () => resolve(getCenterFallback(800, 600));
    img.src = imageUrl;
  });

const analyzeImageForSubject = (
  imageData: ImageData,
  width: number,
  height: number
): DetectionResult => {
  const data = imageData.data;
  const blocksX = Math.ceil(width / BLOCK_SIZE);
  const blocksY = Math.ceil(height / BLOCK_SIZE);

  let maxSaliency = 0;
  let bestBlock = { x: 0, y: 0 };

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const saliency = calculateBlockSaliency(data, width, height, bx * BLOCK_SIZE, by * BLOCK_SIZE);
      if (saliency > maxSaliency) {
        maxSaliency = saliency;
        bestBlock = { x: bx * BLOCK_SIZE, y: by * BLOCK_SIZE };
      }
    }
  }

  if (maxSaliency >= SALIENCY_THRESHOLD) {
    const region: CropRegion = {
      x: Math.max(0, bestBlock.x - BLOCK_SIZE),
      y: Math.max(0, bestBlock.y - BLOCK_SIZE),
      width: Math.min(width - bestBlock.x + BLOCK_SIZE, BLOCK_SIZE * 3),
      height: Math.min(height - bestBlock.y + BLOCK_SIZE, BLOCK_SIZE * 3),
    };

    return {
      region,
      confidence: Math.min(maxSaliency, 1),
      method: 'saliency',
    };
  }

  return getCenterFallback(width, height);
};

const calculateBlockSaliency = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number
): number => {
  let totalVariance = 0;
  let pixelCount = 0;

  const endX = Math.min(startX + BLOCK_SIZE, width);
  const endY = Math.min(startY + BLOCK_SIZE, height);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      const neighbors = getNeighborPixels(data, width, height, x, y);
      const variance = calculatePixelVariance(r, g, b, neighbors);

      totalVariance += variance;
      pixelCount++;
    }
  }

  return pixelCount > 0 ? totalVariance / pixelCount : 0;
};

const getNeighborPixels = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
) => {
  const neighbors = [];

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const idx = (ny * width + nx) * 4;
        neighbors.push({
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
        });
      }
    }
  }

  return neighbors;
};

const calculatePixelVariance = (
  r: number,
  g: number,
  b: number,
  neighbors: Array<{ r: number; g: number; b: number }>
): number => {
  if (neighbors.length === 0) return 0;

  let totalDiff = 0;

  neighbors.forEach((neighbor) => {
    const diff =
      Math.abs(r - neighbor.r) + Math.abs(g - neighbor.g) + Math.abs(b - neighbor.b);
    totalDiff += diff;
  });

  return totalDiff / neighbors.length / 765;
};

const getCenterFallback = (width: number, height: number): DetectionResult => {
  const size = Math.min(width, height) * 0.8;

  return {
    region: {
      x: (width - size) / 2,
      y: (height - size) / 2,
      width: size,
      height: size,
    },
    confidence: 0.5,
    method: 'center-fallback',
  };
};

const expandToAspectRatio = (
  detectedRegion: CropRegion,
  targetRatio: number,
  imageWidth: number,
  imageHeight: number,
  orientation: Orientation
): CropRegion => {
  const { x, y, width, height } = detectedRegion;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const minCoverage = {
    horizontal: 0.85,
    vertical: 0.85,
    square: 0.9,
  } as const;

  let newWidth: number;
  let newHeight: number;

  if (orientation === 'vertical') {
    const minHeight = imageHeight * minCoverage.vertical;
    const detectionHeight = Math.max(height, imageHeight * 0.25);
    newHeight = Math.min(imageHeight, Math.max(detectionHeight * 2.5, minHeight));
    newWidth = newHeight * targetRatio;
    if (newWidth > imageWidth) {
      newWidth = imageWidth;
      newHeight = newWidth / targetRatio;
    }
  } else if (orientation === 'horizontal') {
    const minWidth = imageWidth * minCoverage.horizontal;
    const detectionWidth = Math.max(width, imageWidth * 0.25);
    newWidth = Math.min(imageWidth, Math.max(detectionWidth * 2.5, minWidth));
    newHeight = newWidth / targetRatio;
    if (newHeight > imageHeight) {
      newHeight = imageHeight;
      newWidth = newHeight * targetRatio;
    }
  } else {
    const minSize = Math.min(imageWidth, imageHeight) * minCoverage.square;
    const detectionSize = Math.max(Math.max(width, height), Math.min(imageWidth, imageHeight) * 0.25);
    const targetSize = Math.min(
      Math.min(imageWidth, imageHeight),
      Math.max(detectionSize * 2, minSize)
    );
    newWidth = targetSize;
    newHeight = targetSize;
  }

  let newX = centerX - newWidth / 2;
  let newY = centerY - newHeight / 2;

  newX = Math.max(0, Math.min(newX, imageWidth - newWidth));
  newY = Math.max(0, Math.min(newY, imageHeight - newHeight));

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
  };
};

const applyCropToImage = async (imageUrl: string, cropRegion: CropRegion): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = cropRegion.width;
      canvas.height = cropRegion.height;

      ctx.drawImage(
        img,
        cropRegion.x,
        cropRegion.y,
        cropRegion.width,
        cropRegion.height,
        0,
        0,
        cropRegion.width,
        cropRegion.height
      );

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });

type OrientationRecord<T> = Partial<Record<Orientation, T>>;

const smartCropResultCache = new Map<string, OrientationRecord<SmartCropResult>>();
const smartCropInFlightCache = new Map<string, OrientationRecord<Promise<SmartCropResult>>>();

const ensureRecord = <T>(
  collection: Map<string, OrientationRecord<T>>,
  key: string
): OrientationRecord<T> => {
  let record = collection.get(key);
  if (!record) {
    record = {};
    collection.set(key, record);
  }
  return record;
};

const deleteRecordValue = <T>(
  collection: Map<string, OrientationRecord<T>>,
  key: string,
  orientation: Orientation
) => {
  const record = collection.get(key);
  if (!record) return;
  delete record[orientation];
  if (Object.keys(record).length === 0) {
    collection.delete(key);
  }
};

export const cacheSmartCropResult = (
  imageUrl: string,
  orientation: Orientation,
  result: SmartCropResult
) => {
  const record = ensureRecord(smartCropResultCache, imageUrl);
  record[orientation] = result;
};

export const getCachedSmartCropResult = (
  imageUrl: string,
  orientation: Orientation
): SmartCropResult | undefined => {
  return smartCropResultCache.get(imageUrl)?.[orientation];
};

export const clearSmartCropCacheForImage = (imageUrl: string) => {
  smartCropResultCache.delete(imageUrl);
  smartCropInFlightCache.delete(imageUrl);
};

const createSmartCropFallback = (
  imageUrl: string,
  orientation: Orientation
): SmartCropResult => ({
  orientation,
  dataUrl: imageUrl,
  region: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  imageDimensions: { width: 0, height: 0 },
  generatedAt: Date.now(),
  generatedBy: 'smart',
});

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

  const promise = (async () => {
    try {
      const detection = await detectSubjectRegion(imageUrl);

      return await new Promise<SmartCropResult>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = async () => {
          try {
            const targetRatio =
              orientation === 'vertical' ? 2 / 3 : orientation === 'horizontal' ? 3 / 2 : 1;

            const expandedRegion = expandToAspectRatio(
              detection.region,
              targetRatio,
              img.width,
              img.height,
              orientation
            );

            const croppedUrl = await applyCropToImage(imageUrl, expandedRegion);

            const payload: SmartCropResult = {
              orientation,
              dataUrl: croppedUrl,
              region: expandedRegion,
              imageDimensions: { width: img.width, height: img.height },
              generatedAt: Date.now(),
              generatedBy: 'smart',
              debugInfo: {
                detectionMethod: detection.method,
                detectionConfidence: detection.confidence,
                subjectRegion: detection.region,
                expandedRegion,
              },
            };

            cacheSmartCropResult(imageUrl, orientation, payload);
            resolve(payload);
          } catch (_error) {
            resolve(createSmartCropFallback(imageUrl, orientation));
          }
        };

        img.onerror = () => resolve(createSmartCropFallback(imageUrl, orientation));
        img.src = imageUrl;
      });
    } catch (_error) {
      return createSmartCropFallback(imageUrl, orientation);
    }
  })();

  const record = ensureRecord(smartCropInFlightCache, imageUrl);
  record[orientation] = promise;

  promise.finally(() => {
    deleteRecordValue(smartCropInFlightCache, imageUrl, orientation);
  });

  return promise;
};

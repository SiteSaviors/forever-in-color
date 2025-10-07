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
}

const BLOCK_SIZE = 32;

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
  canvas.width = image.width;
  canvas.height = image.height;

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
    };
  }

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;
  const blocksX = Math.ceil(image.width / BLOCK_SIZE);
  const blocksY = Math.ceil(image.height / BLOCK_SIZE);

  let peakSaliency = 0;
  let targetBlock = { x: 0, y: 0 };

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const saliency = calculateBlockSaliency(data, image.width, image.height, bx, by);
      if (saliency > peakSaliency) {
        peakSaliency = saliency;
        targetBlock = { x: bx * BLOCK_SIZE, y: by * BLOCK_SIZE };
      }
    }
  }

  if (peakSaliency > 0.25) {
    return {
      region: {
        x: Math.max(0, targetBlock.x - BLOCK_SIZE),
        y: Math.max(0, targetBlock.y - BLOCK_SIZE),
        width: Math.min(image.width, BLOCK_SIZE * 3),
        height: Math.min(image.height, BLOCK_SIZE * 3),
      },
      confidence: Math.min(1, peakSaliency),
    };
  }

  const size = Math.min(image.width, image.height) * 0.8;
  return {
    region: {
      x: (image.width - size) / 2,
      y: (image.height - size) / 2,
      width: size,
      height: size,
    },
    confidence: 0.5,
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

  if (orientation === 'square') {
    const size = Math.min(imageWidth, imageHeight) * 0.9;
    newWidth = size;
    newHeight = size;
  } else if (orientation === 'vertical') {
    newHeight = Math.min(imageHeight * 0.95, Math.max(region.height * 1.8, BLOCK_SIZE * 6));
    newWidth = newHeight * ratio;
  } else {
    newWidth = Math.min(imageWidth * 0.95, Math.max(region.width * 1.8, BLOCK_SIZE * 6));
    newHeight = newWidth / ratio;
  }

  let x = centerX - newWidth / 2;
  let y = centerY - newHeight / 2;

  x = Math.max(0, Math.min(x, imageWidth - newWidth));
  y = Math.max(0, Math.min(y, imageHeight - newHeight));

  return { x, y, width: newWidth, height: newHeight };
};

const applyCrop = async (image: HTMLImageElement, region: CropRegion): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return image.src;

  canvas.width = region.width;
  canvas.height = region.height;

  ctx.drawImage(
    image,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    region.width,
    region.height
  );

  return canvas.toDataURL('image/jpeg', 0.92);
};

export const generateSmartCrop = async (
  imageUrl: string,
  orientation: Orientation
): Promise<string> => {
  try {
    const image = await loadImage(imageUrl);
    const detection = analyzeImageForSubject(image);
    const region = expandToAspect(detection.region, image.width, image.height, orientation);
    return await applyCrop(image, region);
  } catch {
    return imageUrl;
  }
};

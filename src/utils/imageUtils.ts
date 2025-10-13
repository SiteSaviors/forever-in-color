export type Orientation = 'horizontal' | 'vertical' | 'square';

const HEIC_EXTENSIONS = ['.heic', '.heif'];

const blobToDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const looksLikeHeic = (file: File): boolean => {
  const type = (file.type || '').toLowerCase();
  if (type === 'image/heic' || type === 'image/heif') {
    return true;
  }
  const name = (file.name || '').toLowerCase();
  return HEIC_EXTENSIONS.some((ext) => name.endsWith(ext));
};

export async function readFileAsDataURL(file: File): Promise<string> {
  if (looksLikeHeic(file)) {
    try {
      const heic2anyModule = await import('heic2any');
      const convert = heic2anyModule.default ?? heic2anyModule;
      const converted = await convert({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.92,
      });
      const outputBlob = Array.isArray(converted) ? converted[0] : converted;
      return blobToDataURL(outputBlob);
    } catch (error) {
      console.warn('[imageUtils] HEIC conversion failed; using original data URL', error);
    }
  }

  return blobToDataURL(file);
}

export async function detectOrientationFromDataUrl(dataUrl: string): Promise<Orientation> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(determineOrientationFromDimensions(image.width, image.height));
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
}

export function determineOrientationFromDimensions(width: number, height: number): Orientation {
  if (width === 0 || height === 0) {
    return 'square';
  }
  const ratio = width / height;
  if (ratio >= 1.2) {
    return 'horizontal';
  }
  if (ratio <= 0.8) {
    return 'vertical';
  }
  return 'square';
}

export async function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  const image = await loadImage(dataUrl);
  return { width: image.width, height: image.height };
}

export async function cropImageToDataUrl(
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
  outputWidth?: number,
  outputHeight?: number
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const width = outputWidth ?? crop.width;
  const height = outputHeight ?? crop.height;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    width,
    height
  );
  return canvas.toDataURL('image/jpeg', 0.92);
}

export function generateCenteredCrop(imageWidth: number, imageHeight: number, aspect = 1): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const imageAspect = imageWidth / imageHeight;
  if (imageAspect > aspect) {
    const height = imageHeight;
    const width = height * aspect;
    const x = (imageWidth - width) / 2;
    return { x, y: 0, width, height };
  }
  const width = imageWidth;
  const height = width / aspect;
  const y = (imageHeight - height) / 2;
  return { x: 0, y, width, height };
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export type Orientation = 'horizontal' | 'vertical' | 'square';

export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function detectOrientationFromDataUrl(dataUrl: string): Promise<Orientation> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (image.width === image.height) {
        resolve('square');
      } else if (image.width > image.height) {
        resolve('horizontal');
      } else {
        resolve('vertical');
      }
    };
    image.onerror = reject;
    image.src = dataUrl;
  });
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

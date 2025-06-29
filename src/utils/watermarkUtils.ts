
export interface WatermarkOptions {
  text?: string;
  fontSize?: number;
  opacity?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  color?: string;
  backgroundColor?: string;
  padding?: number;
}

export const addWatermarkToCanvas = (
  canvas: HTMLCanvasElement,
  options: WatermarkOptions = {}
): HTMLCanvasElement => {
  const {
    text = 'CanvasArt Preview',
    fontSize = 16,
    opacity = 0.7,
    position = 'bottom-right',
    color = 'white',
    backgroundColor = 'rgba(0,0,0,0.5)',
    padding = 10
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.save();
  
  ctx.font = `${fontSize}px Arial`;
  ctx.globalAlpha = opacity;
  
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;
  
  const bgWidth = textWidth + (padding * 2);
  const bgHeight = textHeight + (padding * 2);
  
  let x: number, y: number;
  
  switch (position) {
    case 'bottom-right':
      x = canvas.width - bgWidth - 10;
      y = canvas.height - bgHeight - 10;
      break;
    case 'bottom-left':
      x = 10;
      y = canvas.height - bgHeight - 10;
      break;
    case 'top-right':
      x = canvas.width - bgWidth - 10;
      y = 10;
      break;
    case 'top-left':
      x = 10;
      y = 10;
      break;
    case 'center':
      x = (canvas.width - bgWidth) / 2;
      y = (canvas.height - bgHeight) / 2;
      break;
    default:
      x = canvas.width - bgWidth - 10;
      y = canvas.height - bgHeight - 10;
  }
  
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(x, y, bgWidth, bgHeight);
  
  ctx.fillStyle = color;
  ctx.fillText(text, x + padding, y + padding + textHeight - 4);
  
  ctx.restore();
  
  return canvas;
};

export const addWatermarkToImage = async (
  imageUrl: string,
  options: WatermarkOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      const watermarkedCanvas = addWatermarkToCanvas(canvas, options);
      const watermarkedDataUrl = watermarkedCanvas.toDataURL('image/jpeg', 0.9);
      
      resolve(watermarkedDataUrl);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

export const createWatermarkCanvas = (
  width: number,
  height: number,
  options: WatermarkOptions = {}
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  return addWatermarkToCanvas(canvas, options);
};

export const removeWatermark = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  return canvas;
};

export const isWatermarked = (imageUrl: string): boolean => {
  return imageUrl.includes('preview') || imageUrl.includes('watermark');
};


export class ImageProcessor {
  static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  static setupCanvas(image: HTMLImageElement): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(image.width, 300);
    canvas.height = Math.min(image.height, 300);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return { canvas, ctx };
  }

  static getImageData(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): ImageData {
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
}

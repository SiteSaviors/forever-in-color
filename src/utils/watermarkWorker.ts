
export interface WatermarkWorkerMessage {
  type: 'watermark' | 'batch-watermark';
  imageUrl?: string;
  imageUrls?: string[];
  options?: {
    text?: string;
    opacity?: number;
    position?: string;
    fontSize?: number;
  };
}

export interface WatermarkWorkerResponse {
  type: 'watermark-complete' | 'batch-complete' | 'error';
  result?: string;
  results?: string[];
  error?: string;
}

const watermarkWorkerCode = `
self.onmessage = function(e) {
  const { type, imageUrl, imageUrls, options = {} } = e.data;
  
  const processImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);
      
      const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(imageBitmap, 0, 0);
      
      // Add watermark
      const text = options.text || 'PREVIEW';
      const fontSize = options.fontSize || 16;
      const opacity = options.opacity || 0.7;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.font = fontSize + 'px Arial';
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      
      const textWidth = ctx.measureText(text).width;
      const x = canvas.width - textWidth - 20;
      const y = canvas.height - 20;
      
      ctx.fillRect(x - 10, y - fontSize - 5, textWidth + 20, fontSize + 10);
      ctx.fillStyle = 'white';
      ctx.fillText(text, x, y);
      ctx.restore();
      
      const resultBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(resultBlob);
      });
    } catch (error) {
      throw new Error('Failed to process image: ' + error.message);
    }
  };
  
  if (type === 'watermark' && imageUrl) {
    processImage(imageUrl)
      .then(result => {
        self.postMessage({ type: 'watermark-complete', result });
      })
      .catch(error => {
        self.postMessage({ type: 'error', error: error.message });
      });
  } else if (type === 'batch-watermark' && imageUrls) {
    Promise.all(imageUrls.map(processImage))
      .then(results => {
        self.postMessage({ type: 'batch-complete', results });
      })
      .catch(error => {
        self.postMessage({ type: 'error', error: error.message });
      });
  }
};
`;

let worker: Worker | null = null;

export const createWatermarkWorker = (): Worker => {
  if (!worker) {
    const blob = new Blob([watermarkWorkerCode], { type: 'application/javascript' });
    worker = new Worker(URL.createObjectURL(blob));
  }
  return worker;
};

export const addWatermarkAsync = (
  imageUrl: string,
  options: {
    text?: string;
    opacity?: number;
    position?: string;
    fontSize?: number;
  } = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const workerInstance = createWatermarkWorker();
    
    const handleMessage = (e: MessageEvent<WatermarkWorkerResponse>) => {
      const { type, result, error } = e.data;
      
      if (type === 'watermark-complete' && result) {
        workerInstance.removeEventListener('message', handleMessage);
        resolve(result);
      } else if (type === 'error') {
        workerInstance.removeEventListener('message', handleMessage);
        reject(new Error(error || 'Watermark processing failed'));
      }
    };
    
    workerInstance.addEventListener('message', handleMessage);
    
    workerInstance.postMessage({
      type: 'watermark',
      imageUrl,
      options
    });
  });
};

export const batchWatermarkAsync = (
  imageUrls: string[],
  options: {
    text?: string;
    opacity?: number;
    position?: string;
    fontSize?: number;
  } = {}
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const workerInstance = createWatermarkWorker();
    
    const handleMessage = (e: MessageEvent<WatermarkWorkerResponse>) => {
      const { type, results, error } = e.data;
      
      if (type === 'batch-complete' && results) {
        workerInstance.removeEventListener('message', handleMessage);
        resolve(results);
      } else if (type === 'error') {
        workerInstance.removeEventListener('message', handleMessage);
        reject(new Error(error || 'Batch watermark processing failed'));
      }
    };
    
    workerInstance.addEventListener('message', handleMessage);
    
    workerInstance.postMessage({
      type: 'batch-watermark',
      imageUrls,
      options
    });
  });
};

export const terminateWatermarkWorker = () => {
  if (worker) {
    worker.terminate();
    worker = null;
  }
};

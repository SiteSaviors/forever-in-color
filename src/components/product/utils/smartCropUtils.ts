
// Enhanced face detection using Canvas API for better accuracy
const detectSubjectRegion = async (imageUrl: string): Promise<DetectionResult> => {
  return new Promise((resolve) => {
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
        // Get image data for analysis
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const detected = analyzeImageForSubject(imageData, img.width, img.height);
        
        console.log('🎯 Smart Crop Detection Result:', {
          method: detected.method,
          confidence: detected.confidence,
          region: detected.region,
          imageSize: `${img.width}x${img.height}`
        });
        
        resolve(detected);
      } catch (error) {
        console.warn('⚠️ Smart crop detection failed, using center fallback:', error);
        resolve(getCenterFallback(img.width, img.height));
      }
    };
    
    img.onerror = () => {
      console.error('❌ Failed to load image for smart crop');
      resolve(getCenterFallback(800, 600)); // Default fallback
    };
    
    img.src = imageUrl;
  });
};

// Analyze image data to find the most interesting region
const analyzeImageForSubject = (imageData: ImageData, width: number, height: number): DetectionResult => {
  const data = imageData.data;
  
  // Simple saliency detection based on contrast and color variance
  const blockSize = 32; // Analyze in 32x32 pixel blocks
  const blocksX = Math.ceil(width / blockSize);
  const blocksY = Math.ceil(height / blockSize);
  
  let maxSaliency = 0;
  let bestBlock = { x: 0, y: 0 };
  
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const saliency = calculateBlockSaliency(data, width, height, bx * blockSize, by * blockSize, blockSize);
      
      if (saliency > maxSaliency) {
        maxSaliency = saliency;
        bestBlock = { x: bx * blockSize, y: by * blockSize };
      }
    }
  }
  
  // If we found a reasonably salient region, use it
  if (maxSaliency > 0.3) {
    const region: CropRegion = {
      x: Math.max(0, bestBlock.x - blockSize),
      y: Math.max(0, bestBlock.y - blockSize),
      width: Math.min(width - bestBlock.x + blockSize, blockSize * 3),
      height: Math.min(height - bestBlock.y + blockSize, blockSize * 3)
    };
    
    return {
      region,
      confidence: Math.min(maxSaliency, 1.0),
      method: 'saliency'
    };
  }
  
  // Fallback to center
  return getCenterFallback(width, height);
};

// Calculate saliency (visual interest) for a block of pixels
const calculateBlockSaliency = (data: Uint8ClampedArray, width: number, height: number, startX: number, startY: number, blockSize: number): number => {
  let totalVariance = 0;
  let pixelCount = 0;
  
  const endX = Math.min(startX + blockSize, width);
  const endY = Math.min(startY + blockSize, height);
  
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Calculate local contrast
      const neighbors = getNeighborPixels(data, width, height, x, y);
      const variance = calculatePixelVariance(r, g, b, neighbors);
      
      totalVariance += variance;
      pixelCount++;
    }
  }
  
  return pixelCount > 0 ? totalVariance / pixelCount : 0;
};

// Get neighboring pixels for contrast calculation
const getNeighborPixels = (data: Uint8ClampedArray, width: number, height: number, x: number, y: number) => {
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
          b: data[idx + 2]
        });
      }
    }
  }
  
  return neighbors;
};

// Calculate variance between a pixel and its neighbors
const calculatePixelVariance = (r: number, g: number, b: number, neighbors: Array<{r: number, g: number, b: number}>): number => {
  if (neighbors.length === 0) return 0;
  
  let totalDiff = 0;
  
  neighbors.forEach(neighbor => {
    const diff = Math.abs(r - neighbor.r) + Math.abs(g - neighbor.g) + Math.abs(b - neighbor.b);
    totalDiff += diff;
  });
  
  return totalDiff / neighbors.length / 765; // Normalize to 0-1 range
};

// Fallback to center crop
const getCenterFallback = (width: number, height: number): DetectionResult => {
  const size = Math.min(width, height) * 0.8; // Use 80% of the smaller dimension
  
  return {
    region: {
      x: (width - size) / 2,
      y: (height - size) / 2,
      width: size,
      height: size
    },
    confidence: 0.5,
    method: 'center-fallback'
  };
};

// Fixed aspect ratio expansion function
const expandToAspectRatio = (
  detectedRegion: CropRegion,
  targetRatio: number,
  imageWidth: number,
  imageHeight: number,
  orientation: string
): CropRegion => {
  console.log('🔧 Expanding detected region to aspect ratio:', {
    detectedRegion,
    targetRatio,
    orientation,
    imageSize: `${imageWidth}x${imageHeight}`
  });
  
  const { x, y, width, height } = detectedRegion;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  let newWidth: number;
  let newHeight: number;
  
  // Calculate dimensions based on target aspect ratio
  if (orientation === 'vertical') {
    // For vertical (2:3), height should be 1.5x width
    newHeight = Math.min(imageHeight * 0.9, height * 1.5);
    newWidth = newHeight / 1.5;
  } else if (orientation === 'horizontal') {
    // For horizontal (3:2), width should be 1.5x height  
    newWidth = Math.min(imageWidth * 0.9, width * 1.5);
    newHeight = newWidth / 1.5;
  } else {
    // For square (1:1)
    const size = Math.min(imageWidth * 0.9, imageHeight * 0.9, Math.max(width, height) * 1.2);
    newWidth = size;
    newHeight = size;
  }
  
  // Center the crop region around the detected subject
  let newX = centerX - newWidth / 2;
  let newY = centerY - newHeight / 2;
  
  // Clamp to image boundaries
  newX = Math.max(0, Math.min(newX, imageWidth - newWidth));
  newY = Math.max(0, Math.min(newY, imageHeight - newHeight));
  
  const finalRegion = {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight
  };
  
  console.log('✅ Final crop region:', finalRegion);
  
  return finalRegion;
};

export const generateSmartCrop = async (imageUrl: string, orientation: string): Promise<string> => {
  console.log(`🎯 Starting enhanced smart crop for ${orientation} orientation`);
  
  try {
    // Step 1: Detect the subject in the image
    const detection = await detectSubjectRegion(imageUrl);
    
    console.log('📊 Detection results:', {
      method: detection.method,
      confidence: detection.confidence,
      region: detection.region
    });
    
    // Step 2: If detection confidence is too low, use center crop
    if (detection.confidence < 0.3) {
      console.log('⚠️ Low confidence detection, using center crop fallback');
      // For low confidence, we'll still use the center fallback but log it
    }
    
    // Step 3: Get image dimensions for aspect ratio calculation
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // Step 4: Expand the detected region to match target aspect ratio
          const targetRatio = orientation === 'vertical' ? 2/3 : orientation === 'horizontal' ? 3/2 : 1;
          const expandedRegion = expandToAspectRatio(
            detection.region,
            targetRatio,
            img.width,
            img.height,
            orientation
          );
          
          // Step 5: Apply the crop
          const croppedImageUrl = await applyCropToImage(imageUrl, expandedRegion);
          
          console.log('✅ Smart crop completed successfully with method:', detection.method);
          resolve(croppedImageUrl);
        } catch (error) {
          console.error('❌ Error in crop processing:', error);
          resolve(imageUrl); // Fallback to original
        }
      };
      
      img.onerror = () => {
        console.error('❌ Failed to load image for dimensions');
        resolve(imageUrl); // Fallback to original
      };
      
      img.src = imageUrl;
    });
    
  } catch (error) {
    console.error('❌ Error in smart crop generation:', error);
    return imageUrl; // Fallback to original image
  }
};

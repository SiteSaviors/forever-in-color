const handleWatermark = async (request: any) => {
  const { imageUrl, watermarkUrl, requestId } = request;

  try {
    const [mainImage, watermarkImage] = await Promise.all([
      loadImage(imageUrl),
      loadImage(watermarkUrl),
    ]);

    const canvas = new OffscreenCanvas(mainImage.width, mainImage.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    ctx.drawImage(mainImage, 0, 0);

    const watermarkWidth = mainImage.width * 0.8;
    const aspect = watermarkImage.height / watermarkImage.width;
    const watermarkHeight = watermarkWidth * aspect;
    const x = (mainImage.width - watermarkWidth) / 2;
    const y = (mainImage.height - watermarkHeight) / 2;

    ctx.globalAlpha = 0.25;
    ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
    ctx.globalAlpha = 1;

    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
    const buffer = await blob.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);

    postMessage({
      type: 'success',
      requestId,
      watermarkedImageUrl: `data:image/jpeg;base64,${base64}`,
    });
  } catch (error) {
    postMessage({
      type: 'error',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

self.onmessage = (event: MessageEvent) => {
  const data = event.data;
  if (!data || data.type !== 'watermark') return;
  handleWatermark(data);
};

const loadImage = (src: string): Promise<ImageBitmap> =>
  fetch(src)
    .then((res) => res.blob())
    .then((blob) => createImageBitmap(blob));

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

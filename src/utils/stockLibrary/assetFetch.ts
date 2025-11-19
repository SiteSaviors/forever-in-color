import { getImageDimensions } from '@/utils/imageUtils';

export type StockImageAsset = {
  dataUrl: string;
  width: number;
  height: number;
};

export const fetchImageAsDataUrl = async (url: string): Promise<StockImageAsset> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download stock image (${response.status})`);
  }

  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read stock image'));
    reader.readAsDataURL(blob);
  });

  const { width, height } = await getImageDimensions(dataUrl);
  return { dataUrl, width, height };
};

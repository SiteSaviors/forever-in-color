// Convert base64 to blob for OpenAI API
export async function base64ToBlob(base64String: string): Promise<Blob> {
  const response = await fetch(base64String);
  return response.blob();
}

// Convert aspect ratio to OpenAI size format
export function getImageSize(aspectRatio: string): string {
  switch (aspectRatio) {
    case '16:9':
      return '1792x1024';
    case '9:16':
      return '1024x1792';
    case '3:2':
      return '1536x1024';
    case '2:3':
      return '1024x1536';
    default:
      return '1024x1024'; // default square
  }
}
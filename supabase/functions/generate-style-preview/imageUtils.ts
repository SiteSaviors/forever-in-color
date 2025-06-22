
export const convertBase64ToBlob = (imageData: string): Blob => {
  const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'image/png' });
};

export const createImageEditFormData = (imageData: string, prompt: string): FormData => {
  const formData = new FormData();
  const blob = convertBase64ToBlob(imageData);
  
  formData.append('image', blob, 'image.png');
  formData.append('prompt', prompt);
  formData.append('n', '1');
  formData.append('size', '1024x1024');
  formData.append('response_format', 'b64_json');
  
  return formData;
};

export const extractGeneratedImage = (imageData_result: any): string | null => {
  if (imageData_result.data && imageData_result.data[0]?.b64_json) {
    return `data:image/png;base64,${imageData_result.data[0].b64_json}`;
  } else if (imageData_result.data && imageData_result.data[0]?.url) {
    return imageData_result.data[0].url;
  }
  return null;
};

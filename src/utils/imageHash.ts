export const computeImageDigest = async (dataUrl: string): Promise<string> => {
  if (!dataUrl) {
    return 'missing-image';
  }

  try {
    const response = await fetch(dataUrl);
    const arrayBuffer = await response.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('[imageHash] Failed to compute hash from data URL; falling back to legacy hash', error);
    const encoder = new TextEncoder();
    const data = encoder.encode(dataUrl);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
};

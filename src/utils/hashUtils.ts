const LEGACY_HASH_PREFIX = 'legacy-';

const toHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
};

const computeLegacyHash = (value: string): string => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0; // convert to 32-bit integer
  }
  return `${LEGACY_HASH_PREFIX}${(hash >>> 0).toString(16)}`;
};

export const computeSha256Hex = async (value: string): Promise<string> => {
  if (typeof value !== 'string' || value.length === 0) {
    return computeLegacyHash('');
  }

  const cryptoRef: Crypto | undefined =
    typeof globalThis !== 'undefined' && 'crypto' in globalThis
      ? (globalThis.crypto as Crypto | undefined)
      : undefined;

  if (!cryptoRef?.subtle?.digest) {
    return computeLegacyHash(value);
  }

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await cryptoRef.subtle.digest('SHA-256', data);
    return toHex(hashBuffer);
  } catch (error) {
    console.warn('[hashUtils] Falling back to legacy hash implementation', error);
    return computeLegacyHash(value);
  }
};

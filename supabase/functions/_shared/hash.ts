export type HashInput = ArrayBuffer | Uint8Array | string;

const textEncoder = new TextEncoder();

const ensureArrayBuffer = (input: HashInput): ArrayBuffer => {
  if (input instanceof ArrayBuffer) {
    return input;
  }
  if (input instanceof Uint8Array) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  }
  if (typeof input === 'string') {
    return textEncoder.encode(input).buffer;
  }
  throw new TypeError('Unsupported hash input type');
};

export async function computeSha256Hex(input: HashInput): Promise<string> {
  const buffer = ensureArrayBuffer(input);
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

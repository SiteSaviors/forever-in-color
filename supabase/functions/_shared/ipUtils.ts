const encoder = new TextEncoder();

const sha256 = async (value: string): Promise<string> => {
  const data = encoder.encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const normalizeIpv6 = (ip: string): string => {
  if (!ip.includes('::')) {
    return ip
      .split(':')
      .map((part) => part.padStart(4, '0'))
      .join(':');
  }

  const [leftPart, rightPart = ''] = ip.split('::');
  const leftSegments = leftPart.split(':').filter(Boolean);
  const rightSegments = rightPart.split(':').filter(Boolean);
  const missingSegments = Math.max(0, 8 - leftSegments.length - rightSegments.length);
  const middleSegments = Array(missingSegments).fill('0000');

  return [...leftSegments, ...middleSegments, ...rightSegments]
    .map((segment) => segment.padStart(4, '0'))
    .join(':');
};

export const generateIpHash = async (ip: string | null | undefined): Promise<string | null> => {
  if (!ip) return null;
  const normalized = ip.trim();
  if (!normalized) return null;
  return sha256(normalized.toLowerCase());
};

export const generateSubnetHash = async (ip: string | null | undefined): Promise<string | null> => {
  if (!ip) return null;
  const value = ip.trim();
  if (!value || value === '::1' || value === '127.0.0.1' || value === '::') {
    return null;
  }

  try {
    if (value.includes(':')) {
      if (value.startsWith('::ffff:') || value.includes('::ffff:')) {
        const ipv4Part = value.split(':').pop();
        if (ipv4Part && ipv4Part.includes('.')) {
          const parts = ipv4Part.split('.').slice(0, 3);
          return await sha256(parts.join('.'));
        }
      }

      const normalized = normalizeIpv6(value);
      const groups = normalized.split(':').slice(0, 3);
      if (groups.length >= 3) {
        return await sha256(groups.join(':'));
      }
      return null;
    }

    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts.length !== 4) return null;
      for (const part of parts) {
        const num = Number.parseInt(part, 10);
        if (!Number.isInteger(num) || num < 0 || num > 255) {
          return null;
        }
      }
      return await sha256(parts.slice(0, 3).join('.'));
    }
  } catch {
    return null;
  }

  return null;
};

export { sha256 };

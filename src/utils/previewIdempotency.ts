import type { Orientation } from '@/utils/imageUtils';
import { computeSha256Hex } from './hashUtils';

type PreviewIdempotencyParams = {
  styleId: string;
  orientation: Orientation;
  imageData: string;
  sessionUserId: string | null;
  anonToken: string | null;
  fingerprintHash: string | null;
};

const KEY_PREFIX = 'preview';
const HASH_SEGMENT_LENGTH = 32;

const sanitize = (value: string): string => value.replace(/[^a-zA-Z0-9_-]/g, '-');

const reduceHash = (hash: string): string => {
  if (!hash) {
    return '0'.repeat(HASH_SEGMENT_LENGTH);
  }
  return hash.length > HASH_SEGMENT_LENGTH ? hash.slice(0, HASH_SEGMENT_LENGTH) : hash.padEnd(HASH_SEGMENT_LENGTH, '0');
};

export const buildPreviewIdempotencyKey = async ({
  styleId,
  orientation,
  imageData,
  sessionUserId,
  anonToken,
  fingerprintHash,
}: PreviewIdempotencyParams): Promise<string> => {
  const identitySource = sessionUserId ?? anonToken ?? fingerprintHash ?? 'public';

  const [imageDigest, identityDigest] = await Promise.all([
    computeSha256Hex(imageData),
    computeSha256Hex(identitySource),
  ]);

  const keySegments = [
    KEY_PREFIX,
    `u-${reduceHash(identityDigest)}`,
    `s-${sanitize(styleId) || 'unknown-style'}`,
    `o-${sanitize(orientation)}`,
    `i-${reduceHash(imageDigest)}`,
  ];

  return keySegments.join('|');
};


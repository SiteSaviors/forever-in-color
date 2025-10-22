import type { Orientation } from '@/utils/imageUtils';
import { computeSha256Hex } from './hashUtils';

type PreviewIdempotencyParams = {
  styleId: string;
  orientation: Orientation;
  imageHash: string;
  sessionUserId: string | null;
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
  imageHash,
  sessionUserId,
}: PreviewIdempotencyParams): Promise<string> => {
  const identitySource = sessionUserId ?? 'unauthenticated';
  const identityDigest = await computeSha256Hex(identitySource);
  const imageDigest = imageHash;

  const keySegments = [
    KEY_PREFIX,
    `u-${reduceHash(identityDigest)}`,
    `s-${sanitize(styleId) || 'unknown-style'}`,
    `o-${sanitize(orientation)}`,
    `i-${reduceHash(imageDigest)}`,
  ];

  return keySegments.join('|');
};

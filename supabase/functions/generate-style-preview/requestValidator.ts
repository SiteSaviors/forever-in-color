import { parseStoragePath } from '../_shared/storageUtils.ts';
import {
  previewRequestSchema,
  qualityEnum,
  type PreviewRequest,
} from '../../../shared/validation/previewSchemas.ts';

const legacyQualityMap: Record<string, PreviewRequest['quality']> = {
  preview: 'medium',
  final: 'high',
};

const coerceLegacyQuality = (value: unknown): PreviewRequest['quality'] => {
  if (typeof value !== 'string') return 'medium';
  if (legacyQualityMap[value]) {
    return legacyQualityMap[value];
  }
  return qualityEnum.safeParse(value).success ? (value as PreviewRequest['quality']) : 'medium';
};

export function validateRequest(body: unknown): { isValid: boolean; error?: string; data?: PreviewRequest } {
  if (typeof body !== 'object' || body === null) {
    return { isValid: false, error: 'Invalid request payload' };
  }

  const input = { ...body } as Record<string, unknown>;

  if (typeof input.quality !== 'undefined') {
    input.quality = coerceLegacyQuality(input.quality);
  }

  const parsed = previewRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      isValid: false,
      error: parsed.error.errors.map((issue) => issue.message).join('; '),
    };
  }

  const { imageUrl } = parsed.data;
  const trimmedImageUrl = imageUrl.trim();

  const storageRef = parseStoragePath(trimmedImageUrl);

  if (!trimmedImageUrl.startsWith('data:image/') && !storageRef) {
    return {
      isValid: false,
      error: 'Unsupported imageUrl. Only data URIs or Wondertone storage paths are allowed.',
    };
  }

  return {
    isValid: true,
    data: parsed.data,
  };
}

import { z } from 'zod';

export const qualityEnum = z.enum(['low', 'medium', 'high', 'auto']);

export const previewRequestSchema = z
  .object({
    imageUrl: z.string().min(1, 'imageUrl is required'),
    style: z.string().min(1, 'style is required'),
    photoId: z.string().optional(),
    aspectRatio: z
      .string()
      .regex(/^\d+:\d+$/, 'aspectRatio must be formatted like width:height')
      .default('1:1'),
    watermark: z.boolean().default(true),
    quality: qualityEnum.default('medium'),
    cacheBypass: z.boolean().default(false),
    isAuthenticated: z.boolean().optional(),
  })
  .passthrough();

const previewBaseSchema = z
  .object({
    requiresWatermark: z.boolean().optional(),
    requires_watermark: z.boolean().optional(),
    remainingTokens: z.number().nullable().optional(),
    remaining_tokens: z.number().nullable().optional(),
    tier: z.string().optional(),
    priority: z.string().optional(),
    storageUrl: z.string().nullable().optional(),
    storagePath: z.string().nullable().optional(),
    storage_url: z.string().nullable().optional(),
    storage_path: z.string().nullable().optional(),
    softRemaining: z.number().nullable().optional(),
    soft_remaining: z.number().nullable().optional(),
  })
  .passthrough();

export const previewCompleteSchema = z
  .object({
    previewUrl: z.string().url().optional(),
    preview_url: z.string().url().optional(),
    status: z.literal('complete').optional(),
  })
  .merge(previewBaseSchema);

export const previewProcessingSchema = z
  .object({
    previewUrl: z.string().nullable().optional(),
    preview_url: z.string().nullable().optional(),
    requestId: z.string().optional(),
    request_id: z.string().optional(),
    status: z.literal('processing').optional(),
  })
  .merge(previewBaseSchema);

export type PreviewResponse = {
  status: 'complete';
  previewUrl: string;
  requiresWatermark: boolean;
  remainingTokens: number | null;
  tier?: string;
  priority?: string;
  storageUrl?: string | null;
  storagePath?: string | null;
  softRemaining?: number | null;
} | {
  status: 'processing';
  previewUrl: null;
  requestId: string;
  requiresWatermark: boolean;
  remainingTokens: number | null;
  tier?: string;
  priority?: string;
  storageUrl?: string | null;
  storagePath?: string | null;
  softRemaining?: number | null;
};

export const previewStatusSchema = z
  .object({
    request_id: z.string(),
    status: z.string(),
    preview_url: z.string().nullable().optional(),
    error: z.string().nullable().optional(),
  })
  .passthrough();

export type PreviewRequest = z.infer<typeof previewRequestSchema>;
export type PreviewStatusResponse = z.infer<typeof previewStatusSchema>;

const extractBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  return fallback;
};

const extractNullableNumber = (value: unknown): number | null => {
  if (typeof value === 'number') return value;
  return null;
};

export const normalizePreviewResponse = (data: unknown): PreviewResponse => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid preview response payload');
    }

  const source = data as Record<string, unknown>;
  const status = typeof source.status === 'string' ? source.status : undefined;
  const previewUrlValue = source.previewUrl ?? source.preview_url;
  const requestIdValue = source.requestId ?? source.request_id;

  const toComplete = () => {
    const parsed = previewCompleteSchema.safeParse({ ...source, previewUrl: previewUrlValue });
    if (!parsed.success) return null;
    const normalized = parsed.data;
    const previewUrl = (normalized.previewUrl ?? normalized.preview_url) as string | undefined;
    if (!previewUrl) return null;
    return {
      status: 'complete' as const,
      previewUrl,
      requiresWatermark: extractBoolean(
        normalized.requiresWatermark ?? normalized.requires_watermark,
        false
      ),
      remainingTokens: extractNullableNumber(
        normalized.remainingTokens ?? normalized.remaining_tokens ?? null
      ),
      tier: normalized.tier,
      priority: normalized.priority,
      storageUrl: normalized.storageUrl ?? normalized.storage_url ?? null,
      storagePath: normalized.storagePath ?? normalized.storage_path ?? null,
      softRemaining: extractNullableNumber(
        normalized.softRemaining ?? normalized.soft_remaining ?? null
      ),
    } satisfies PreviewResponse;
  };

  const toProcessing = () => {
    const parsed = previewProcessingSchema.safeParse({ ...source, requestId: requestIdValue });
    if (!parsed.success) return null;
    const normalized = parsed.data;
    const requestId = (normalized.requestId ?? normalized.request_id) as string | undefined;
    if (!requestId) return null;
    return {
      status: 'processing' as const,
      previewUrl: null,
      requestId,
      requiresWatermark: extractBoolean(
        normalized.requiresWatermark ?? normalized.requires_watermark,
        false
      ),
      remainingTokens: extractNullableNumber(
        normalized.remainingTokens ?? normalized.remaining_tokens ?? null
      ),
      tier: normalized.tier,
      priority: normalized.priority,
      storageUrl: normalized.storageUrl ?? normalized.storage_url ?? null,
      storagePath: normalized.storagePath ?? normalized.storage_path ?? null,
      softRemaining: extractNullableNumber(
        normalized.softRemaining ?? normalized.soft_remaining ?? null
      ),
    } satisfies PreviewResponse;
  };

  if (status === 'complete' || typeof previewUrlValue === 'string') {
    const complete = toComplete();
    if (complete) {
      return complete;
    }
  }

  if (status === 'processing' || typeof requestIdValue === 'string') {
    const processing = toProcessing();
    if (processing) {
      return processing;
    }
  }

  throw new Error('Invalid preview response payload');
};

export const parsePreviewStatusResponse = (data: unknown): PreviewStatusResponse =>
  previewStatusSchema.parse(data);

export const parsePreviewRequest = (data: unknown): PreviewRequest =>
  previewRequestSchema.parse(data);

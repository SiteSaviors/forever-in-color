import { describe, expect, it } from 'vitest';

import {
  previewRequestSchema,
  previewCompleteSchema,
  previewProcessingSchema,
  previewStatusSchema,
} from '../../shared/validation/previewSchemaDefinitions';

import {
  normalizePreviewResponse,
  parsePreviewRequest,
  parsePreviewStatusResponse,
} from '../../shared/validation/previewSchemas';

describe('preview runtime validators', () => {
  it('parses preview requests matching zod output', () => {
    const input = {
      imageUrl: 'data:image/png;base64,AAA',
      style: 'modern-tone',
      aspectRatio: '3:4',
      cacheBypass: true,
      watermark: false,
      quality: 'high',
      isAuthenticated: true,
      cropConfig: {
        x: 10,
        y: 10,
        width: 512,
        height: 512,
        orientation: 'portrait',
      },
      customField: 'keep-me',
    };

    const zodParsed = previewRequestSchema.parse(input);
    const runtimeParsed = parsePreviewRequest(structuredClone(input));

    expect(runtimeParsed).toEqual(zodParsed);
  });

  it('applies defaults when fields are missing', () => {
    const input = {
      imageUrl: 'data:image/png;base64,AAA',
      style: 'modern-tone',
    };

    const runtimeParsed = parsePreviewRequest(structuredClone(input));

    expect(runtimeParsed.aspectRatio).toBe('1:1');
    expect(runtimeParsed.quality).toBe('medium');
    expect(runtimeParsed.cacheBypass).toBe(false);
    expect(runtimeParsed.watermark).toBe(true);
  });

  it('throws for invalid preview request', () => {
    expect(() => parsePreviewRequest({ style: 'modern-tone' })).toThrow();
    expect(() => parsePreviewRequest({ imageUrl: '', style: 'modern-tone' })).toThrow();
    expect(() => parsePreviewRequest('bad')).toThrow();
  });

  it('normalizes complete preview responses', () => {
    const payload = {
      status: 'complete',
      previewUrl: 'https://cdn.wondertone.ai/previews/1.jpg',
      requiresWatermark: false,
      remainingTokens: 12,
      customField: 'keep-me',
    };

    const runtime = normalizePreviewResponse(structuredClone(payload));
    const zodParsed = previewCompleteSchema.parse(payload);

    expect(runtime.previewUrl).toBe(zodParsed.previewUrl);
    expect(runtime.requiresWatermark).toBe(false);
    expect(runtime.remainingTokens).toBe(12);
    expect(runtime.status).toBe('complete');
  });

  it('normalizes processing preview responses', () => {
    const payload = {
      status: 'processing',
      request_id: 'req_123',
      requestId: 'req_123',
      requires_watermark: true,
      remaining_tokens: null,
    };

    const runtime = normalizePreviewResponse(structuredClone(payload));
    const zodParsed = previewProcessingSchema.parse(payload);

    expect(runtime.status).toBe('processing');
    expect(runtime.requestId).toBe(zodParsed.requestId ?? zodParsed.request_id);
    expect(runtime.requiresWatermark).toBe(true);
  });

  it('throws for invalid preview response', () => {
    expect(() => normalizePreviewResponse({ status: 'complete' })).toThrow();
    expect(() => normalizePreviewResponse('bad')).toThrow();
  });

  it('parses preview status responses', () => {
    const payload = {
      request_id: 'req_123',
      status: 'processing',
      preview_url: null,
      custom: 'keep-me',
    };

    const runtime = parsePreviewStatusResponse(structuredClone(payload));
    const zodParsed = previewStatusSchema.parse(payload);

    expect(runtime.request_id).toBe(zodParsed.request_id);
    expect(runtime.status).toBe(zodParsed.status);
    expect(runtime.preview_url).toBeNull();
  });

  it('throws for invalid preview status payload', () => {
    expect(() => parsePreviewStatusResponse({ status: 'processing' })).toThrow();
    expect(() => parsePreviewStatusResponse('bad')).toThrow();
  });
});

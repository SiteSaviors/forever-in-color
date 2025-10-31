import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { useFounderStore } from '@/store/useFounderStore';
import { clearPreviewCache } from '@/store/previewCacheStore';
import type { StyleOption } from '@/store/founder/storeTypes';

vi.mock('@/utils/founderPreviewGeneration', () => ({
  startFounderPreviewGeneration: vi.fn(async () => ({
    previewUrl: 'https://cdn.example.com/ready.jpg',
    requiresWatermark: false,
    remainingTokens: 5,
    tier: 'creator',
    priority: 'normal',
    softRemaining: null,
    storageUrl: null,
    storagePath: null,
    sourceStoragePath: null,
    sourceDisplayUrl: null,
    previewLogId: null,
    cropConfig: null,
  })),
}));

vi.mock('@/utils/telemetry', () => ({
  emitStepOneEvent: vi.fn(),
  emitAuthGateEvent: vi.fn(),
}));

vi.mock('@/utils/previewAnalytics', () => ({
  logPreviewStage: vi.fn(),
}));

vi.mock('@/utils/playPreviewChime', () => ({
  playPreviewChime: vi.fn(),
}));

vi.mock('@/utils/imageHash', () => ({
  computeImageDigest: vi.fn(async () => 'digest'),
}));

vi.mock('@/utils/previewIdempotency', () => ({
  buildPreviewIdempotencyKey: vi.fn(async () => 'key'),
}));

vi.mock('@/utils/authGate', () => ({
  shouldRequireAuthGate: () => false,
}));

vi.mock('@/features/preview', () => ({
  executeStartPreview: vi.fn(),
}));

vi.mock('@/config/featureFlags', () => ({
  ENABLE_PREVIEW_QUERY_EXPERIMENT: false,
}));

import { startFounderPreviewGeneration } from '@/utils/founderPreviewGeneration';

const mockedStartPreview = vi.mocked(startFounderPreviewGeneration);

const baseStyle = (id: string): StyleOption => ({
  id,
  name: id,
  description: '',
  thumbnail: '',
  preview: '',
  priceModifier: 0,
});

const resetStore = () => {
  clearPreviewCache();
  const styleA = baseStyle('classic-oil');
  const styleB = baseStyle('calm-watercolor');

  useFounderStore.setState((state) => ({
    ...state,
    styles: [styleA, styleB],
    previews: {
      [styleA.id]: { status: 'idle' },
      [styleB.id]: { status: 'idle' },
    },
    croppedImage: 'data:image/png;base64,AAA',
    uploadedImage: 'data:image/png;base64,AAA',
    originalImage: 'data:image/png;base64,AAA',
    smartCrops: {},
    entitlements: {
      ...state.entitlements,
      status: 'ready',
      remainingTokens: 10,
      requiresWatermark: false,
    },
    evaluateStyleGate: () => ({ allowed: true, reason: 'allowed' }),
    updateEntitlementsFromResponse: vi.fn(),
    incrementGenerationCount: vi.fn(),
    pendingStyleId: null,
  }));
};

describe('startStylePreview lock guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window === 'undefined') {
      Object.assign(globalThis, { window: globalThis });
    }
    resetStore();
  });

  afterEach(() => {
    useFounderStore.setState({ pendingStyleId: null });
  });

  it('prevents different styles from starting while a preview is in flight', async () => {
    const { styles, startStylePreview } = useFounderStore.getState();
    const [styleA, styleB] = styles;

    const first = startStylePreview(styleA);
    const second = startStylePreview(styleB);

    await Promise.allSettled([first, second]);

    expect(startFounderPreviewGeneration).toHaveBeenCalledTimes(1);
    expect(useFounderStore.getState().pendingStyleId).toBeNull();
  });

  it('prevents re-triggering same style without force', async () => {
    const { styles, startStylePreview } = useFounderStore.getState();
    const [styleA] = styles;

    const first = startStylePreview(styleA);
    const second = startStylePreview(styleA);

    await Promise.allSettled([first, second]);

    expect(startFounderPreviewGeneration).toHaveBeenCalledTimes(1);
    expect(useFounderStore.getState().pendingStyleId).toBeNull();
  });

  it('allows force regeneration for the same style', async () => {
    const { styles, startStylePreview } = useFounderStore.getState();
    const [styleA] = styles;

    const first = startStylePreview(styleA);
    const second = startStylePreview(styleA, { force: true });

    await Promise.allSettled([first, second]);

    expect(startFounderPreviewGeneration).toHaveBeenCalledTimes(2);
    expect(useFounderStore.getState().pendingStyleId).toBeNull();
  });

  it('clears pendingStyleId when preview generation fails', async () => {
    const { styles, startStylePreview } = useFounderStore.getState();
    const [styleA] = styles;

    mockedStartPreview.mockRejectedValueOnce(new Error('network failure'));

    await startStylePreview(styleA);

    expect(useFounderStore.getState().pendingStyleId).toBeNull();
  });
});

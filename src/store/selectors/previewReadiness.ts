import type { Orientation } from '@/utils/imageUtils';
import type { PreviewState, StylePreviewCacheEntry } from '@/store/founder/storeTypes';
import { createMemoizedSelector } from '@/store/utils/memo';

type PreviewStateMap = Record<string, PreviewState | undefined>;
type PreviewCacheSnapshot = Record<string, Partial<Record<Orientation, StylePreviewCacheEntry>>>;

export type StylePreviewReadiness = {
  hasPreview: boolean;
  previewUrl: string | null;
  orientation: Orientation | null;
  orientationMatches: boolean;
  source: 'live' | 'cache' | null;
  completedAt: number | null;
  isRegenerating: boolean;
  isOrientationPending: boolean;
};

export type PreviewReadinessMap = Record<string, StylePreviewReadiness>;

export const computePreviewReadiness = createMemoizedSelector(
  (
    previews: PreviewStateMap,
    orientation: Orientation,
    pendingStyleId: string | null,
    orientationPreviewPending: boolean,
    cache: PreviewCacheSnapshot
  ): PreviewReadinessMap => {
    const readiness: PreviewReadinessMap = {};

    const previewEntries = Object.entries(previews ?? {});

    for (const [styleId, previewState] of previewEntries) {
      const previewData = previewState?.data;
      const previewOrientation = previewState?.orientation ?? null;
      const orientationMatches =
        previewOrientation == null ? true : previewOrientation === orientation;

      const livePreviewUrl = previewData?.previewUrl ?? null;
      const cacheEntry = cache?.[styleId]?.[orientation];
      const cachedPreviewUrl = cacheEntry?.url ?? null;

      const previewUrl = livePreviewUrl ?? cachedPreviewUrl ?? null;
      const source: 'live' | 'cache' | null = livePreviewUrl ? 'live' : cachedPreviewUrl ? 'cache' : null;
      const completedAt: number | null =
        previewData?.completedAt ??
        previewData?.startedAt ??
        cacheEntry?.generatedAt ??
        null;

      const hasPreview = Boolean(previewUrl);
      const isRegenerating = pendingStyleId === styleId;
      const isOrientationPending = orientationPreviewPending && isRegenerating;

      readiness[styleId] = {
        hasPreview,
        previewUrl,
        orientation: previewOrientation,
        orientationMatches,
        source,
        completedAt,
        isRegenerating,
        isOrientationPending,
      };
    }

    return readiness;
  }
);

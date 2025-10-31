import { shallow } from 'zustand/shallow';
import { useFounderStore } from '@/store/useFounderStore';
import { usePreviewCacheStore } from '@/store/previewCacheStore';
import { computePreviewReadiness } from '@/store/selectors/previewReadiness';

export const usePreviewReadiness = () => {
  const { previews, orientation, pendingStyleId, orientationPreviewPending } = useFounderStore(
    (state) => ({
      previews: state.previews,
      orientation: state.orientation,
      pendingStyleId: state.pendingStyleId,
      orientationPreviewPending: state.orientationPreviewPending,
    }),
    shallow
  );

  const cache = usePreviewCacheStore((state) => state.cache);

  return computePreviewReadiness(previews, orientation, pendingStyleId, orientationPreviewPending, cache);
};

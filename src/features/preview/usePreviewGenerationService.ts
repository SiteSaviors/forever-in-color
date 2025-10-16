import { useRef } from 'react';
import { useMutation, type UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { ENABLE_PREVIEW_QUERY_EXPERIMENT } from '@/config/featureFlags';
import { executeStartPreview, type StartPreviewRequest, previewQueryKeys } from './previewQueries';

type PreviewMutation = UseMutationResult<
  Awaited<ReturnType<typeof executeStartPreview>>,
  unknown,
  StartPreviewRequest
>;

type LegacyPreviewService = {
  mode: 'legacy';
};

type ReactQueryPreviewService = {
  mode: 'react-query';
  mutation: PreviewMutation;
  cancelInFlight: () => void;
  invalidatePreview: (styleId: string, orientation: string) => void;
};

export type PreviewGenerationService = LegacyPreviewService | ReactQueryPreviewService;

const usePreviewGenerationServiceDisabled = (): PreviewGenerationService => ({
  mode: 'legacy',
});

const usePreviewGenerationServiceEnabled = (): PreviewGenerationService => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: StartPreviewRequest) => {
      // Cancel any in-flight preview before starting a new one.
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        return await executeStartPreview({
          ...variables,
          signal: controller.signal,
        });
      } finally {
        // Clear reference once the request resolves or rejects.
        abortControllerRef.current = null;
      }
    },
  });

  const cancelInFlight = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const invalidatePreview = (styleId: string, orientation: string) => {
    void queryClient.invalidateQueries({
      queryKey: previewQueryKeys.byStyleOrientation(styleId, orientation),
    });
  };

  return {
    mode: 'react-query',
    mutation,
    cancelInFlight,
    invalidatePreview,
  };
};

export const usePreviewGenerationService: () => PreviewGenerationService = ENABLE_PREVIEW_QUERY_EXPERIMENT
  ? usePreviewGenerationServiceEnabled
  : usePreviewGenerationServiceDisabled;

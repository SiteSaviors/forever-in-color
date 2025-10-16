import { startFounderPreviewGeneration, type FounderPreviewResult } from '@/utils/founderPreviewGeneration';

export type StartPreviewStageCallback = Parameters<typeof startFounderPreviewGeneration>[0]['onStage'];

export type StartPreviewRequest = {
  imageUrl: string;
  styleId: string;
  styleName: string;
  aspectRatio: string;
  anonToken: string | null;
  accessToken: string | null;
  idempotencyKey: string;
  fingerprintHash: string | null;
  onStage?: StartPreviewStageCallback;
  signal?: AbortSignal;
};

export type StartPreviewResponse = FounderPreviewResult;

export const previewQueryKeys = {
  root: ['preview'] as const,
  byStyle: (styleId: string) => [...previewQueryKeys.root, styleId] as const,
  byStyleOrientation: (styleId: string, orientation: string) =>
    [...previewQueryKeys.byStyle(styleId), orientation] as const,
};

export const executeStartPreview = async (request: StartPreviewRequest): Promise<StartPreviewResponse> => {
  const { signal, ...rest } = request;
  return startFounderPreviewGeneration({
    ...rest,
    signal,
    onStage: rest.onStage,
  });
};

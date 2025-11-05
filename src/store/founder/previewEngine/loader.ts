import type { Orientation } from '@/utils/imageUtils';
import type { StartPreviewOptions, StyleOption } from '../storeTypes';
import type { PreviewEngineRuntime } from './core';

type PreviewEngineModule = typeof import('./core');

let previewEnginePromise: Promise<PreviewEngineModule> | null = null;

const importPreviewEngine = () => import('./core');

export const loadPreviewEngine = (): Promise<PreviewEngineModule> => {
  if (!previewEnginePromise) {
    previewEnginePromise = importPreviewEngine();
  }
  return previewEnginePromise;
};

export const startStylePreviewEngine = async (
  runtime: PreviewEngineRuntime,
  style: StyleOption,
  options: StartPreviewOptions = {}
) => {
  const { startStylePreviewFlow } = await loadPreviewEngine();
  return startStylePreviewFlow(runtime, style, options);
};

export const generatePreviewsEngine = async (
  runtime: PreviewEngineRuntime,
  ids?: string[],
  options: { force?: boolean; orientationOverride?: Orientation } = {}
) => {
  const { generatePreviewsFlow } = await loadPreviewEngine();
  return generatePreviewsFlow(runtime, ids, options);
};

export const resumePendingAuthPreviewEngine = async (runtime: PreviewEngineRuntime) => {
  const { resumePendingAuthPreviewFlow } = await loadPreviewEngine();
  return resumePendingAuthPreviewFlow(runtime);
};

export const abortPreviewGenerationEngine = async (runtime: PreviewEngineRuntime) => {
  const { abortPreviewGenerationFlow } = await loadPreviewEngine();
  return abortPreviewGenerationFlow(runtime);
};

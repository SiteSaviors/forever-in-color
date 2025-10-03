import { fetchPreviewStatus } from '@/utils/stylePreviewApi';

export interface PollPreviewOptions {
  maxAttempts?: number;
  initialDelay?: number;
  backoffFactor?: number;
  maxDelay?: number;
}

/**
 * Polls preview generation status until ready or timeout.
 * Shared by useStylePreview and usePreviewGeneration.
 *
 * @param requestId - The preview request ID to poll
 * @param options - Polling configuration (optional)
 * @returns Preview URL when ready
 * @throws Error if generation fails or times out
 */
export const pollPreviewStatusUntilReady = async (
  requestId: string,
  options: PollPreviewOptions = {}
): Promise<string> => {
  const {
    maxAttempts = 30,
    initialDelay = 500,
    backoffFactor = 250,
    maxDelay = 4000
  } = options;

  let attempt = 0;

  while (attempt < maxAttempts) {
    const status = await fetchPreviewStatus(requestId);
    const normalizedStatus = status.status?.toLowerCase();

    if ((normalizedStatus === 'succeeded' || normalizedStatus === 'complete') && status.preview_url) {
      return status.preview_url as string;
    }

    if (normalizedStatus === 'failed' || normalizedStatus === 'error') {
      throw new Error(status.error || 'Preview generation failed');
    }

    attempt += 1;
    const wait = Math.min(maxDelay, initialDelay + attempt * backoffFactor);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }

  throw new Error('Preview generation timed out. Please try again.');
};

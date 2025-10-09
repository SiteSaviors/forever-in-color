import { fetchPreviewStatus } from './stylePreviewApi';

export interface PollPreviewOptions {
  maxAttempts?: number;
  initialDelay?: number;
  backoffFactor?: number;
  maxDelay?: number;
}

export const pollPreviewStatusUntilReady = async (
  requestId: string,
  options: PollPreviewOptions = {}
): Promise<string> => {
  const {
    maxAttempts = 25,
    initialDelay = 400,
    backoffFactor = 200,
    maxDelay = 3200,
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

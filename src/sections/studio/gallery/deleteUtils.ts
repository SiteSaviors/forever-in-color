export type DeleteErrorCode = 'auth' | 'network' | 'server' | 'unknown';

export const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

export const resolveDeleteError = (
  error: unknown
): { message: string; code: DeleteErrorCode; status?: number } => {
  if (error instanceof TypeError) {
    return {
      message: 'Unable to reach Wondertone. Check your connection and try again.',
      code: 'network',
    };
  }

  if (error && typeof error === 'object' && 'status' in error) {
    const status = Number((error as { status?: unknown }).status);
    if (status === 401) {
      return {
        message: 'Please sign in to manage your gallery.',
        code: 'auth',
        status,
      };
    }
    if (status >= 500) {
      return {
        message: 'Delete failed on our side. Please try again shortly.',
        code: 'server',
        status,
      };
    }
    return {
      message: 'Unable to delete this preview. Please try again.',
      code: 'unknown',
      status,
    };
  }

  const fallbackMessage =
    error instanceof Error ? error.message : 'Unable to delete this preview. Please try again.';
  return {
    message: fallbackMessage,
    code: 'unknown',
  };
};

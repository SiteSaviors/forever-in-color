/**
 * @vitest-environment jsdom
 */
import { useEffect, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useWelcomeBannerHandlers } from '@/hooks/studio/useWelcomeBannerHandlers';

vi.mock('@/store/hooks/studio/useStudioPreviewState', () => ({
  useStudioPreviewState: vi.fn(),
}));

vi.mock('@/store/hooks/studio/useStudioEntitlementState', () => ({
  useStudioEntitlementState: vi.fn(),
}));

vi.mock('@/store/hooks/studio/useStudioUiState', () => ({
  useStudioUiState: vi.fn(),
}));

vi.mock('@/store/hooks/studio/useStudioActions', () => ({
  useStudioActions: vi.fn(),
}));

vi.mock('@/utils/launchflowTelemetry', () => ({
  trackLaunchflowEditReopen: vi.fn(),
  trackLaunchflowOpened: vi.fn(),
}));

const { useStudioPreviewState } = await import('@/store/hooks/studio/useStudioPreviewState');
const { useStudioEntitlementState } = await import('@/store/hooks/studio/useStudioEntitlementState');
const { useStudioUiState } = await import('@/store/hooks/studio/useStudioUiState');
const { useStudioActions } = await import('@/store/hooks/studio/useStudioActions');
const { trackLaunchflowEditReopen, trackLaunchflowOpened } = await import('@/utils/launchflowTelemetry');

describe('useWelcomeBannerHandlers', () => {
  const setLaunchpadExpanded = vi.fn();

  const renderHookWithState = async (overrides: {
    hasCroppedImage?: boolean;
    firstPreviewCompleted?: boolean;
    generationCount?: number;
    launchpadExpanded?: boolean;
  } = {}) => {
    (useStudioPreviewState as vi.Mock).mockReturnValue({
      hasCroppedImage: overrides.hasCroppedImage ?? true,
    });
    (useStudioEntitlementState as vi.Mock).mockReturnValue({
      firstPreviewCompleted: overrides.firstPreviewCompleted ?? true,
      generationCount: overrides.generationCount ?? 1,
    });
    (useStudioUiState as vi.Mock).mockReturnValue({
      launchpadExpanded: overrides.launchpadExpanded ?? false,
    });
    (useStudioActions as vi.Mock).mockReturnValue({
      setLaunchpadExpanded,
    });

    let renderer: ReactTestRenderer;
    const latest: { current: ReturnType<typeof useWelcomeBannerHandlers> | null } = { current: null };

    const Bridge = ({ children }: { children?: ReactNode }) => {
      const handlers = useWelcomeBannerHandlers();
      useEffect(() => {
        latest.current = handlers;
      }, [handlers]);
      return <>{children}</>;
    };

    await act(async () => {
      renderer = create(<Bridge />);
    });

    if (!latest.current) {
      throw new Error('Welcome banner handlers not initialised');
    }

    return {
      getHandlers: () => {
        if (!latest.current) {
          throw new Error('Handlers unavailable');
        }
        return latest.current;
      },
      updateLaunchpadExpanded: async (value: boolean) => {
        (useStudioUiState as vi.Mock).mockReturnValue({
          launchpadExpanded: value,
        });
        await act(async () => {
          renderer.update(<Bridge />);
        });
      },
      unmount: () => renderer.unmount(),
    };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    setLaunchpadExpanded.mockClear();
    trackLaunchflowOpened.mockClear();
    trackLaunchflowEditReopen.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('suppresses banner when user has no cropped image', async () => {
    const { getHandlers, unmount } = await renderHookWithState({
      hasCroppedImage: false,
      firstPreviewCompleted: true,
    });

    expect(getHandlers().showReturningBanner).toBe(false);

    unmount();
  });

  it('shows banner for returning users and dismisses on edit', async () => {
    const { getHandlers, unmount } = await renderHookWithState({
      hasCroppedImage: true,
      firstPreviewCompleted: true,
      launchpadExpanded: false,
    });

    expect(getHandlers().showReturningBanner).toBe(true);

    await act(async () => {
      getHandlers().handleEditFromWelcome();
    });

    expect(trackLaunchflowOpened).toHaveBeenCalledWith('welcome_banner');
    expect(trackLaunchflowEditReopen).toHaveBeenCalledWith('welcome_banner');
    expect(setLaunchpadExpanded).toHaveBeenCalledWith(true);
    expect(getHandlers().welcomeDismissed).toBe(true);

    unmount();
  });

  it('marks banner dismissed when user manually dismisses', async () => {
    const { getHandlers, unmount } = await renderHookWithState();

    await act(async () => {
      getHandlers().handleDismissWelcome();
    });

    expect(getHandlers().welcomeDismissed).toBe(true);

    unmount();
  });

  it('automatically dismisses when launchpad expands', async () => {
    const { getHandlers, updateLaunchpadExpanded, unmount } = await renderHookWithState({
      launchpadExpanded: false,
    });

    expect(getHandlers().welcomeDismissed).toBe(false);

    await updateLaunchpadExpanded(true);

    expect(getHandlers().welcomeDismissed).toBe(true);

    unmount();
  });
});


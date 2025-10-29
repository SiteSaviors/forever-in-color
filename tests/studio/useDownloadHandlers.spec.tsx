/**
 * @vitest-environment jsdom
 */
import { useEffect, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { StudioExperienceProvider, StudioOverlayProvider } from '@/sections/studio/experience/context';
import { useDownloadHandlers } from '@/hooks/studio/useDownloadHandlers';

vi.mock('@/store/hooks/studio/useStudioPreviewState', () => ({
  useStudioPreviewState: vi.fn(),
}));

vi.mock('@/store/hooks/studio/useStudioEntitlementState', () => ({
  useStudioEntitlementState: vi.fn(),
}));

vi.mock('@/store/hooks/studio/useStudioUserState', () => ({
  useStudioUserState: vi.fn(),
}));

vi.mock('@/utils/premiumDownload', () => ({
  downloadCleanImage: vi.fn(),
}));

vi.mock('@/utils/telemetry', () => ({
  trackDownloadSuccess: vi.fn(),
}));

const { useStudioPreviewState } = await import('@/store/hooks/studio/useStudioPreviewState');
const { useStudioEntitlementState } = await import('@/store/hooks/studio/useStudioEntitlementState');
const { useStudioUserState } = await import('@/store/hooks/studio/useStudioUserState');
const { downloadCleanImage } = await import('@/utils/premiumDownload');
const { trackDownloadSuccess } = await import('@/utils/telemetry');

describe('useDownloadHandlers', () => {
  const showToast = vi.fn();
  const showUpgradeModal = vi.fn();
  const openDownloadUpgrade = vi.fn();
  const closeDownloadUpgrade = vi.fn();
  const showCanvasUpsellToast = vi.fn();
  const hideCanvasUpsellToast = vi.fn();
  const setMobileDrawerOpen = vi.fn();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <StudioExperienceProvider value={{ showToast, showUpgradeModal, renderFeedback: () => null }}>
      <StudioOverlayProvider
        value={{
          isDownloadUpgradeOpen: false,
          openDownloadUpgrade,
          closeDownloadUpgrade,
          isCanvasUpsellToastVisible: false,
          showCanvasUpsellToast,
          hideCanvasUpsellToast,
          isMobileDrawerOpen: false,
          setMobileDrawerOpen,
        }}
      >
        {children}
      </StudioOverlayProvider>
    </StudioExperienceProvider>
  );

  const renderDownloadHook = async () => {
    let renderer: ReactTestRenderer;
    let resolveHandlers: (handlers: ReturnType<typeof useDownloadHandlers>) => void;
    const handlersPromise = new Promise<ReturnType<typeof useDownloadHandlers>>((resolve) => {
      resolveHandlers = resolve;
    });

    const Bridge = () => {
      const handlers = useDownloadHandlers();
      useEffect(() => {
        resolveHandlers!(handlers);
      }, [handlers]);
      return null;
    };

    await act(async () => {
      renderer = create(
        <Wrapper>
          <Bridge />
        </Wrapper>
      );
    });

    const handlers = await handlersPromise;

    return {
      handlers,
      unmount: () => renderer.unmount(),
    };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    showToast.mockClear();
    showUpgradeModal.mockClear();
    openDownloadUpgrade.mockClear();
    closeDownloadUpgrade.mockClear();
    showCanvasUpsellToast.mockClear();
    hideCanvasUpsellToast.mockClear();
    setMobileDrawerOpen.mockClear();
    (useStudioPreviewState as vi.Mock).mockReturnValue({
      currentStyle: null,
      preview: null,
    });
    (useStudioEntitlementState as vi.Mock).mockReturnValue({
      requiresWatermark: false,
      userTier: 'free',
    });
    (useStudioUserState as vi.Mock).mockReturnValue({
      sessionAccessToken: 'token',
    });
    (downloadCleanImage as vi.Mock).mockReset();
    (downloadCleanImage as vi.Mock).mockResolvedValue(undefined);
    (trackDownloadSuccess as vi.Mock).mockClear();
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(new Blob(['test']), {
        status: 200,
      })
    );
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:url'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
    vi.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('warns when download is requested without a preview', async () => {
    (useStudioPreviewState as vi.Mock).mockReturnValue({
      currentStyle: null,
      preview: null,
    });

    const { handlers, unmount } = await renderDownloadHook();

    await act(async () => {
      await handlers.handleDownloadHD();
    });

    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Download unavailable',
      })
    );
    expect(handlers.downloadingHD).toBe(false);

    unmount();
  });

  it('downloads watermarked preview and triggers upgrade + upsell toast', async () => {
    (useStudioPreviewState as vi.Mock).mockReturnValue({
      currentStyle: { id: 'style-1', name: 'Aurora Dreams' },
      preview: {
        data: {
          previewUrl: 'https://cdn.example.com/watermark.jpg',
          storagePath: null,
          storageUrl: null,
        },
        status: 'ready',
      },
    });
    (useStudioEntitlementState as vi.Mock).mockReturnValue({
      requiresWatermark: true,
      userTier: 'free',
    });

    const fetchSpy = vi.spyOn(global, 'fetch');

    const { handlers, unmount } = await renderDownloadHook();

    await act(async () => {
      await handlers.handleDownloadHD();
    });

    expect(fetchSpy).toHaveBeenCalledWith('https://cdn.example.com/watermark.jpg', { credentials: 'omit' });
    expect(openDownloadUpgrade).toHaveBeenCalledTimes(1);
    expect(trackDownloadSuccess).toHaveBeenCalledWith('free', 'style-1');
    expect(showCanvasUpsellToast).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(8000);
    });
    expect(hideCanvasUpsellToast).toHaveBeenCalled();

    unmount();
  });

  it('downloads clean preview via storage path when user is premium', async () => {
    (useStudioPreviewState as vi.Mock).mockReturnValue({
      currentStyle: { id: 'style-2', name: 'Golden Hour' },
      preview: {
        data: {
          previewUrl: 'https://cdn.example.com/preview.jpg',
          storagePath: null,
          storageUrl: 'https://cdn.example.com/preview-cache/user123.jpg',
        },
        status: 'ready',
      },
    });
    (useStudioEntitlementState as vi.Mock).mockReturnValue({
      requiresWatermark: false,
      userTier: 'pro',
    });

    const { handlers, unmount } = await renderDownloadHook();

    await act(async () => {
      await handlers.handleDownloadHD();
    });

    expect(downloadCleanImage).toHaveBeenCalledWith(
      expect.objectContaining({
        storagePath: 'preview-cache/user123.jpg',
        accessToken: 'token',
      })
    );
    expect(openDownloadUpgrade).not.toHaveBeenCalled();
    expect(trackDownloadSuccess).toHaveBeenCalledWith('pro', 'style-2');

    unmount();
  });
});

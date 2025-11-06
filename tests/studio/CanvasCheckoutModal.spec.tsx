/**
 * @vitest-environment jsdom
 */
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import CanvasCheckoutModal from '@/components/studio/CanvasCheckoutModal';

vi.mock('@/components/studio/CanvasInRoomPreview', () => ({
  default: () => <div data-testid="canvas-preview" />,
}));

vi.mock('@radix-ui/react-dialog', () => {
  const Root = ({ children }: { children: React.ReactNode }) => <div data-dialog-root>{children}</div>;
  const Portal = ({ children }: { children: React.ReactNode }) => <div data-dialog-portal>{children}</div>;
  const Overlay = ({ children, ...rest }: any) => (
    <div data-dialog-overlay {...rest}>
      {children}
    </div>
  );
  const Content = ({ children, ...rest }: any) => (
    <div data-dialog-content {...rest}>
      {children}
    </div>
  );
  const Title = ({ children }: { children: React.ReactNode }) => <div data-dialog-title>{children}</div>;
  const Description = ({ children }: { children: React.ReactNode }) => (
    <div data-dialog-description>{children}</div>
  );
  return { Root, Portal, Overlay, Content, Title, Description };
});

const closeCanvasModalMock = vi.fn();
const setCanvasSizeMock = vi.fn();
const setFrameMock = vi.fn();
const toggleEnhancementMock = vi.fn();
const setLivingCanvasModalOpenMock = vi.fn();
const computedTotalMock = vi.fn();
const resetCheckoutMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/store/hooks/useCanvasConfigStore', () => ({
  useCanvasConfigState: vi.fn(() => ({
    canvasModalOpen: true,
    selectedCanvasSize: '16x20',
    selectedFrame: 'none',
    enhancements: [
      { id: 'floating-frame', name: 'Floating Frame', price: 59, description: '', enabled: true },
      { id: 'living-canvas', name: 'Living Canvas', price: 49, description: '', enabled: false },
    ],
    orientationPreviewPending: false,
  })),
  useCanvasConfigActions: vi.fn(() => ({
    closeCanvasModal: closeCanvasModalMock,
    setCanvasSize: setCanvasSizeMock,
    setFrame: setFrameMock,
    toggleEnhancement: toggleEnhancementMock,
    setLivingCanvasModalOpen: setLivingCanvasModalOpenMock,
    computedTotal: computedTotalMock,
  })),
}));

vi.mock('@/store/hooks/useStyleCatalogStore', () => ({
  useStyleCatalogState: vi.fn(() => ({
    currentStyle: { id: 'style-1', name: 'Aurora Dreams', thumbnail: null },
  })),
}));

vi.mock('@/store/hooks/useUploadStore', () => ({
  useUploadState: vi.fn(() => ({
    orientation: 'square',
  })),
}));

vi.mock('@/store/hooks/useEntitlementsStore', () => ({
  useEntitlementsState: vi.fn(() => ({
    userTier: 'pro',
  })),
}));

vi.mock('@/store/useCheckoutStore', () => ({
  useCheckoutStore: (selector: (state: { resetCheckout: () => void }) => unknown) =>
    selector({ resetCheckout: resetCheckoutMock }),
}));

vi.mock('@/utils/telemetry', () => ({
  trackOrderStarted: vi.fn(),
}));

const { trackOrderStarted } = await import('@/utils/telemetry');

const findButton = (root: HTMLElement, label: string) =>
  Array.from(root.querySelectorAll('button')).find((button) =>
    button.textContent?.includes(label)
  ) as HTMLButtonElement | undefined;

describe('CanvasCheckoutModal telemetry', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    computedTotalMock.mockReturnValue(249);
    resetCheckoutMock.mockClear();
    navigateMock.mockClear();
    (trackOrderStarted as vi.Mock).mockClear();
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    closeCanvasModalMock.mockClear();
    setCanvasSizeMock.mockClear();
    setFrameMock.mockClear();
    toggleEnhancementMock.mockClear();
    setLivingCanvasModalOpenMock.mockClear();
  });

  it('emits trackOrderStarted before navigating to checkout', async () => {
    act(() => {
      root.render(<CanvasCheckoutModal />);
    });

    const cta = findButton(document.body, 'Complete Your Order');
    expect(cta).toBeTruthy();

    await act(async () => {
      cta?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(trackOrderStarted).toHaveBeenCalledWith('pro', 249, true);
    expect(resetCheckoutMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/checkout');
  });
});

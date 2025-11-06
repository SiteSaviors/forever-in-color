/**
 * @vitest-environment jsdom
 */
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import SecondaryCanvasCta from '@/components/studio/InsightsRail/SecondaryCanvasCta';
import * as studioAnalytics from '@/utils/studioV2Analytics';

describe('SecondaryCanvasCta telemetry', () => {
  it('emits analytics and delegates to onRequestCanvas when clicked', async () => {
    const analyticsSpy = vi.spyOn(studioAnalytics, 'trackStudioV2CanvasCtaClick').mockImplementation(() => {});
    const onRequestCanvas = vi.fn();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <SecondaryCanvasCta
          styleId="style-123"
          orientation="square"
          disabled={false}
          onRequestCanvas={onRequestCanvas}
        />
      );
    });

    const button = container.querySelector('button');
    expect(button).toBeTruthy();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(analyticsSpy).toHaveBeenCalledWith({
      styleId: 'style-123',
      orientation: 'square',
      source: 'rail',
    });
    expect(onRequestCanvas).toHaveBeenCalledWith('rail');

    root.unmount();
    container.remove();
  });
});

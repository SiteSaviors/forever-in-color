import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import TestRenderer from 'react-test-renderer';
import ActionGrid from '@/components/studio/ActionGrid';

const fakeWindow = {
  setTimeout: (handler: (...args: unknown[]) => void, timeout?: number) =>
    global.setTimeout(handler, timeout),
  clearTimeout: (id?: number | ReturnType<typeof setTimeout>) =>
    global.clearTimeout(id as ReturnType<typeof setTimeout>),
} as unknown as Window & typeof globalThis;

vi.stubGlobal('window', fakeWindow);

describe('ActionGrid', () => {
  it('invokes onCreateCanvas when Create Canvas button is clicked', () => {
    const onDownload = vi.fn();
    const onCreateCanvas = vi.fn();
    const onChangeOrientation = vi.fn();
    const onSaveToGallery = vi.fn();

    const renderer = TestRenderer.create(
      <ActionGrid
        onDownload={onDownload}
        onCreateCanvas={onCreateCanvas}
        onChangeOrientation={onChangeOrientation}
        onSaveToGallery={onSaveToGallery}
        downloading={false}
        downloadDisabled={false}
        createCanvasDisabled={false}
        orientationDisabled={false}
        savingToGallery={false}
        savedToGallery={false}
        isPremiumUser
      />
    );

    const buttons = renderer.root.findAllByType('button');
    const createCanvasButton = buttons[1];

    createCanvasButton.props.onClick();

    expect(onCreateCanvas).toHaveBeenCalledTimes(1);
    expect(onDownload).not.toHaveBeenCalled();
  });
});

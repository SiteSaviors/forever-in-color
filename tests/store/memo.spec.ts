import { describe, expect, it, vi } from 'vitest';
import { createMemoizedSelector } from '@/store/utils/memo';

describe('createMemoizedSelector', () => {
  it('returns cached result when arguments are referentially equal', () => {
    const projector = vi.fn((a: number, b: number) => a + b);
    const selector = createMemoizedSelector(projector);

    expect(selector(1, 2)).toBe(3);
    expect(selector(1, 2)).toBe(3);
    expect(projector).toHaveBeenCalledTimes(1);
  });

  it('recomputes when any argument reference changes', () => {
    const projector = vi.fn((arr: number[]) => arr.reduce((sum, value) => sum + value, 0));
    const selector = createMemoizedSelector(projector);

    const numbers = [1, 2, 3];
    expect(selector(numbers)).toBe(6);
    expect(projector).toHaveBeenCalledTimes(1);

    expect(selector([...numbers])).toBe(6);
    expect(projector).toHaveBeenCalledTimes(2);
  });
});

type EqualsFn<Args extends unknown[]> = (a: Args, b: Args) => boolean;

const defaultArgsEqual = <Args extends unknown[]>(previous: Args, next: Args): boolean => {
  if (previous.length !== next.length) {
    return false;
  }
  for (let index = 0; index < previous.length; index += 1) {
    if (previous[index] !== next[index]) {
      return false;
    }
  }
  return true;
};

export const createMemoizedSelector = <Args extends unknown[], Result>(
  projector: (...args: Args) => Result,
  equals: EqualsFn<Args> = defaultArgsEqual
) => {
  let lastArgs: Args | null = null;
  let hasValue = false;
  let lastResult: Result;

  return (...args: Args): Result => {
    if (hasValue && lastArgs && equals(lastArgs, args)) {
      return lastResult;
    }

    lastResult = projector(...args);
    lastArgs = args;
    hasValue = true;
    return lastResult;
  };
};

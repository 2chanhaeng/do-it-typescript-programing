export function* range(
  start: number,
  stop?: number,
  step: number = 1
): Generator<number> {
  if (stop === undefined) {
    yield* range(0, start, step);
  } else if (step * (stop - start) > 0) {
    yield start;
    yield* range(start + step, stop, step);
  }
}

export function fold<T, R>(
  iter: Iterable<T>,
  callback: (acc: R, curr: T) => R,
  initial: R,
  index: number = 0
): R {
  const { value, done } = iter[Symbol.iterator]().next();
  if (done) return initial;
  return fold(iter, callback, callback(initial, value), index + 1);
}


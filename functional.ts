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

export function* filter<T>(
  iter: Iterable<T>,
  callback: (curr: T, index?: number) => boolean,
  index: number = 0
): Iterable<T> {
  const { value, done } = iter[Symbol.iterator]().next();
  if (done) return;
  if (callback(value, index)) yield value;
  yield* filter(iter, callback, index + 1);
}

export function* map<T, R>(
  iter: Iterable<T>,
  callback: (curr: T, index?: number) => R,
  index: number = 0
): Iterable<R> {
  const { value, done } = iter[Symbol.iterator]().next();
  if (done) return;
  yield callback(value, index);
  yield* map(iter, callback, index + 1);
}

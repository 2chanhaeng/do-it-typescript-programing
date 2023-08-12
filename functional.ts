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

function oneOrZero(n: number) {
  return n === 0 ? 0 : n > 0 ? 1 : -1;
}

export function sort<T>(
  arr: readonly T[],
  compareFunction: (a: T, b: T) => number = (a, b) => <any>b - <any>a
): T[] {
  if (arr.length <= 1) {
    return arr as T[];
  }
  const cmp = (a: T, b: T) => oneOrZero(compareFunction(a, b));
  const rest: T[] = structuredClone(arr) as T[];
  const pivot = rest.shift()!;
  const left: T[] = [];
  const same: T[] = [pivot];
  const right: T[] = [];
  rest.forEach((curr) => {
    [same, left, right].at(cmp(curr, pivot))?.push(curr);
  });
  return [sort(left, cmp), same, sort(right, cmp)].flat(1);
}

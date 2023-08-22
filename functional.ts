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

  index: number = 0

export function filter<T>(
  callback: (curr: T) => boolean,
  iterable: Iterable<T>
) {
  return Array.isArray(iterable)
    ? filterIter(callback, iter(iterable))
    : filterIter(callback, iterable);
}
function* filterIter<T>(
  callback: (curr: T) => boolean,
  iterable: Iterable<T>
): Iterable<T> {
  const { value, done } = iterable[Symbol.iterator]().next();
  if (done) return;
  if (callback(value)) yield value;
  yield* filterIter(callback, iterable);
}

export function map<T, R>(
  callback: (curr: T) => R,
  iterable: Iterable<T> | T[]
) {
  return Array.isArray(iterable)
    ? mapIter(callback, iter(iterable))
    : mapIter(callback, iterable);
}

function* mapIter<T, R>(
  callback: (curr: T) => R,
  iter: Iterable<T>
): Iterable<R> {
  const { value, done } = iter[Symbol.iterator]().next();
  if (done) return;
  yield callback(value);
  yield* mapIter(callback, iter);
}

export function reduce<T, R>(
  callback: (acc: R, curr: T, index?: number) => R,
  acc: R,
  iterable: Iterable<T> | T[]
) {
  return Array.isArray(iterable)
    ? reduceIter(callback, acc, iter(iterable))
    : reduceIter(callback, acc, iterable);
}

function reduceIter<T, R>(
  callback: (acc: R, curr: T) => R,
  acc: R,
  iterable: Iterable<T>
): R {
  const { value, done } = iterable[Symbol.iterator]().next();
  if (done) return acc;
  return reduceIter(callback, callback(acc, value), iterable);
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

export const compose =
  <T, R>(...fns: Function[]) =>
  (x: T): R =>
    fns.reduceRight((v, f) => f(v), x) as unknown as R;

export const pipe =
  <T, R>(...fns: Function[]) =>
  (x: T) =>
    fns.reduce((v, f) => f(v), x) as unknown as R;

export const iter: <T>(arr: T[]) => Iterable<T> = (arr) =>
  arr[Symbol.iterator]();

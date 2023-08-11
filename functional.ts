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


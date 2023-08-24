type nullable = null | undefined;
type Nullable<T> = T | nullable;

interface Valuable<T> {
  getOrElse: (defaultValue: T) => T;
}
interface Functor<T> {
  map: <U>(fn: (value: T) => U) => Functor<U>;
}

class Some<T> implements Valuable<T>, Functor<T> {
  constructor(private value: T) {}
  getOrElse(defaultValue: T) {
    return this.value ?? defaultValue;
  }
  map<U>(fn: (value: T) => U) {
    return new Some<U>(fn(this.value));
  }
}

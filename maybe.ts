import { Monad } from "./interface";

interface IMaybe<T> {
  get isJust(): boolean;
  get isNothing(): boolean;
  getOrElse<U>(arg0: U): T | U;
}

@Monad
class Just<T> implements IMaybe<T> {
  constructor(private init: T) {}
  get value() {
    return this.init;
  }
  static of = <T>(value: T) => new Just<T>(value);
  get isJust() {
    return true;
  }
  get isNothing() {
    return false;
  }
  getOrElse = <U>(_: U) => this.value;
  map = <U>(fn: (x: T) => U) => new Just<U>(fn(this.value));
  ap = <U>(other: Just<(x: T) => U>) => Just.of<U>(other.value(this.value));
  chain = <U>(fn: (x: T) => Just<U>) => fn(this.value);
}

@Monad
class Nothing implements IMaybe<never> {
  static of = () => new Nothing();
  get isJust() {
    return false;
  }
  get isNothing() {
    return true;
  }
  getOrElse = <U>(other: U) => other;
  map = <U>(_: (x: never) => U) => this;
  ap = (_: any) => this;
  chain = (_: Function) => this;
}

export class Maybe {
  static Just = <T>(value: T) => Just.of<T>(value);
  static Nothing = new Nothing();
}

import { Monad, Setoid, staticImplements } from "./interface";

@staticImplements<Monad<unknown>>()
class Identity<T> implements Setoid<T> {
  constructor(private init: T) {}
  get value(): T {
    return this.init;
  }
  equals<U>(other: U): boolean {
    return other instanceof Identity ? other.value === this.value : false;
  }
  map<U>(fn: (x: T) => U): Identity<U> {
    return new Identity(fn(this.value));
  }
  static of<T>(value: T): Identity<T> {
    return new Identity<T>(value);
  }
  ap(other: Identity<any>): never;
  ap<U>(other: Identity<(x: T) => U>): Identity<U>;
  ap<U>(other: Identity<(x: T) => U> | Identity<any>) {
    if (this.value instanceof Function) {
      return Identity.of<U>(this.value(other.value));
    }
  }
  chain<U>(arg0: (x: T) => Identity<U>): Identity<U> {
    return arg0(this.value);
  }
}

const add = (x: number) => (y: number) => x + y;
const inc = (x: number) => Identity.of(x).map(add(1));
const one = Identity.of(1);
console.log(one.chain(inc).equals(inc(1)));
console.log(one.chain(Identity.of).equals(one));

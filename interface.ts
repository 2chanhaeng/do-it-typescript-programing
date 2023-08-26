interface Valuable<T> {
  get value(): T;
}
/**
 * @link  https://github.com/fantasyland/fantasy-land#setoid
 * 1. a.equals(a) === true (반사성)
 * 1. a.equals(b) === b.equals(a) (대칭성)
 * 1. a.equals(b) && b.equals(c) === a.equals(c) (추이성)
 */
export interface Setoid<T> extends Valuable<T> {
  /**
   * 1. `value` 는 동일한 `Setoid` 이어야 한다.
   *     1. `Setoid` 가 아닐 경우, `equals` 의 동작은 정의되지 않는다. (`false` 를 추천함)
   * 1. `equals` 는 `boolean` 을 반환한다.
   */
  equals<U>(value: Setoid<U>): boolean;
}
/**
 * @link https://github.com/fantasyland/fantasy-land#functor
 * 1. `u.map(a => a)` 는 `u` 와 동일하다. (항등성)
 * 1. `u.map(x => f(g(x)))` 는 `u.map(g).map(f)` 와 동일하다. (합성)
 */
interface Functor<T> {
  /**
   * 1. `arg0` 는 함수여야 한다.
   *     1. `arg0` 가 함수가 아닌 경우의 `map` 의 동작은 정의되지 않는다.
   *     1. `arg0` 는 어떤 값이든 반환할 수 있다.
   *     1. `arg0` 의 반환 값을 체크하지 않는다.
   * 1. `map` 의 반환값은 동일한 `Functor` 이어야 한다.
   */
  map<U>(arg0: (x: T) => U): Functor<U>;
}
/**
 * @link https://github.com/fantasyland/fantasy-land#apply
 * 1. `v.ap(u.ap(a.map(f => g => x => f(g(x)))))` 는 `v.ap(u).ap(a)` 와 같다. (합성)
 */
interface Apply<T> extends Functor<T> {
  /**
   * 1. `arg0` 는 함수의 `Apply` 이어야 한다. // `arg0: Apply<(x: T) => U>`
   *     1. 함수가 아니라면, `ap` 의 동작은 정의되지 않는다. // `arg0` 는 함수일 때만 보장, 아니면 알아서 처리
   *     1. `arg0` 는 `obj` 와 같은 `Apply` 이어야 한다. // 인스턴스도 인자도 `Apply` 여야 한다.
   * 1. `obj` 는 어떤 값의 `Apply` 이어야 한다. // `obj: Apply<T>`
   * 1. `ap` 는 `Apply<(x: T) => U>` 의 함수를 `Apply<T>` 의 값에 적용해야 한다.
   *     // 기존 인스턴스 `Apply` 속 값을 인자로 들어온 `Apply` 속 함수에 넣고 호출하는 것이 `ap` 의 역할이다.
   *     1. 반환값을 체크할 필요는 없다.
   * 1. `ap` 에 의해 반환되는 `Apply` 는 `obj` 와 `arg0` 과 같아야 한다.
   */
  ap<U>(arg0: Apply<(x: T) => U>): Apply<U>;
}
/**
 * @link https://github.com/fantasyland/fantasy-land#applicative
 * 1. `v.ap(A.of(x => x))` 는 `v`와 동일하다. (항등성)
 * 1. `A.of(x).ap(A.of(f))` 는 `A.of(f(x))` 와 동일하다. (준동형)
 * 1. `A.of(y).ap(u)` 는 `u.ap(A.of(f => f(y)))` 와 동일하다. (교환)
 */
interface Applicative<T> {
  /**
   * 1. `of` 는 동일한 `Applicative` 값을 반환해야 한다.
   *    1. `arg0` 값을 체크하지 않는다.
   */
  new (init: T): Apply<T>;
  of(value: T): Apply<T>;
}
/**
 * @link https://github.com/fantasyland/fantasy-land#chain
 * 1. `m.chain(f).chain(g)` 는 `m.chain(x => f(x).chain(g))` 와 동일하다. (결합법칙)
 */
interface Chain<T> extends Apply<T> {
  /**
   * 1. `arg0` 는 값을 반환하는 함수이다..
   *     1. `arg0` 가 함수가 아니라면 `chain` 의 동작은 정의되지 않는다.
   *     1. `arg0` 는 동일한 `Chain` 값을 반환해야 한다.
   * 1. `chain` 는 동일한 `Chain` 값을 반환해야 한다.
   */
  chain<U>(arg0: (x: T) => Chain<U>): Chain<U>;
}

export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {};
}

/**
 * @link https://github.com/fantasyland/fantasy-land#monad
 */
export interface Monad<T> extends Applicative<T> {
  new (init: T): Chain<T>;
}

export const Monad = staticImplements<Monad<unknown>>();

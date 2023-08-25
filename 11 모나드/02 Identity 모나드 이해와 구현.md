# Identity 모나드 이해와 구현

- [Identity 모나드 이해와 구현](#identity-모나드-이해와-구현)
  - [`Identity`](#identity)
  - [`Valuable`](#valuable)
  - [`Setoid`](#setoid)
  - [`Functor`](#functor)
  - [`Apply`](#apply)
  - [`Applicative`](#applicative)
  - [`Chain`](#chain)
  - [`Monad`](#monad)
  - [왼쪽 법칙과 오른쪽 법칙](#왼쪽-법칙과-오른쪽-법칙)

## `Identity`

책에서는 모나드의 예시로 `Identity` 클래스를 들었다.  
`Identity` 클래스는 범주론에서 타입을 변환했다가 다시 원래 타입으로 되돌아 와도 값이 변경되지 않는 범주라고 한다.  
책에서 정의하는 인터페이스들과 `Identity` 구현을 따라하며, 내 스타일에 맞도록 조금씩 변형했다.  
[판타지랜드 규격](https://github.com/fantasyland/fantasy-land)과 책의 내용이 다를 경우 규격을 우선시했다.

## `Valuable`

`Valuable` 인터페이스는 `value` 라는 속성의 getter를 가지고 있다.  
`Identity` 모나드 속에 담긴 값을 가져오기 위해 사용한다.  
책에서는 일반적인 메소드로 구현했지만 나는 `get` 키워드를 이용해 getter 임을 명시했다.

```ts
interface Valuable<T> {
  get value(): T;
}
```

구현은 생산자에서 `init` 요소를 받아 `private` 필드에 저장하고, `value` getter에서 해당 필드의 값을 반환하도록 했다.  
책에서는 `init` 이 아닌 `_value` 라는 이름을 사용했는데 내가 알기로는 `_<변수명>` 은 JS에서 private 필드가 없던 시절 유저들끼리 약속한 네이밍 컨벤션이라고 한다.  
일단 TS에서는 `private` 키워드를 사용할 수도 있고, 현재는 JS에서도 private 필드를 지원하므로(`#<변수명>`) 해당 네이밍 컨벤션 대신 `private` 키워드만을 사용했다.

```ts
class Identity<T> implements Valuable<T> {
  constructor(private init: T) {}
  get value(): T {
    return this.init;
  }
}
```

## `Setoid`

`Setoid` 인터페이스는 값이 동일한지를 비교할 수 있는 `equals` 메소드를 가지고 있다.  
해당 메소드는 `boolean` 을 반환하며 [동치관계](https://ko.wikipedia.org/wiki/%EB%8F%99%EC%B9%98%EA%B4%80%EA%B3%84)를 만족시켜야 한다.  
책에서는 나오지 않았지만 [판타지랜드 규격](https://github.com/fantasyland/fantasy-land#setoid)에 따르면 인자를 `Setoid` 로 제한시켰다.  
그래서 나도 `equals` 메소드의 인자를 `Setoid` 로 제한시켰다.

```ts
/**
 * @link  https://github.com/fantasyland/fantasy-land#setoid
 * 1. a.equals(a) === true (반사성)
 * 1. a.equals(b) === b.equals(a) (대칭성)
 * 1. a.equals(b) && b.equals(c) === a.equals(c) (추이성)
 */
interface Setoid<T> extends Valuable<T> {
  /**
   * 1. `value` 는 동일한 `Setoid` 이어야 한다.
   *     1. `Setoid` 가 아닐 경우, `equals` 의 동작은 정의되지 않는다. (`false` 를 추천함)
   * 1. `equals` 는 `boolean` 을 반환한다.
   */
  equals<U>(value: Setoid<U>): boolean;
}
```

구현은 책에 잘 되어 있어서 비슷하게 했다.

```ts
class Identity<T> implements Setoid<T> {
  ...
  equals<U>(other: U): boolean {
    return other instanceof Identity ? other.value === this.value : false;
  }
}
```

## `Functor`

`Functor` 인터페이스는 `map` 메소드를 가지고 있다.  
책에서 `Functor` 는 자기 자신을 반환하는 `endofunctor` 의 성질을 만족해야 한다고 설명했다.  
하지만 TS 의 기능이 부족해 해당 성질을 만족시킬 수 없는 인터페이스를 만들 수 밖에 없다고 설명했다.  
당시에는 재귀적인 인터페이스 정의가 안 됐었나보다.  
현재는 가능하므로 문제 없이 `Functor` 와 `map` 을 정의할 수 있었다.

```ts
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
```

구현은 `Setoid` 와 마찬가지로 책에 잘 되어 있어서 비슷하게 했다.

```ts
class Identity<T> implements Setoid<T>, Functor<T> {
  ...
  map<U>(fn: (x: T) => U): Identity<U> {
    return new Identity(fn(this.value));
  }
}
```

## `Apply`

책에서는 세세한 타입 정의를 모두 빼버렸는데 나는 최대한 열심히 정의했다.  
특히 [규격](https://github.com/fantasyland/fantasy-land#apply)에 따르면 인자는 함수여야 한다고 분명히 명시하고 있다.  
하지만 책에서는 이를 무시했는데 이유를 잘 모르겠다.

```ts
/**
 * @link https://github.com/fantasyland/fantasy-land#apply
 * 1. `v.ap(u.ap(a.map(f => g => x => f(g(x)))))` 는 `v.ap(u).ap(a)` 와 같다. (합성)
 */
interface Apply<T> extends Functor<T> {
  /**
   * 1. `arg0` 는 함수의 `Apply` 이어야 한다. // `arg0: Apply<(x: T) => U>`
   *     1. 함수가 아니라면, `ap` 의 동작은 정의되지 않는다.
   *     1. `arg0` 는 `obj` 와 같은 `Apply` 이어야 한다. // 여러 `Apply` 구현체가 있겠지만 인스턴스와 `ap` 메소드 인자로 들어온 값은 같은 `Apply` 구현체여야 한다는 의미로 이해했다.
   * 1. `obj` 는 어떤 값의 `Apply` 이어야 한다. // `obj: Apply<T>`
   * 1. `ap` 는 `Apply<(x: T) => U>` 의 함수를 `Apply<T>` 의 값에 적용해야 한다.
   *     // 기존 인스턴스 `Apply` 속 값을 인자로 들어온 `Apply` 속 함수에 넣고 호출하는 것이 `ap` 의 역할이다.
   *     1. 반환값을 체크할 필요는 없다.
   * 1. `ap` 에 의해 반환되는 `Apply` 는 `obj` 와 `arg0` 과 같아야 한다.
   */
  ap<U>(arg0: Apply<(x: T) => U>): Apply<U>;
}
```

구현은 오버로딩을 통해 인자가 함수의 `Identity` 인 경우와 아닌 경우를 나눴다.  
이후 `f` 에 `this.value` 를 정의하는 부분만 생략하고 나머지는 책과 동일하다.

```ts
class Identity<T> implements Setoid<T>, Apply<T> {
  ...
  ap(other: Identity<any>): never;
  ap<U>(other: Identity<(x: T) => U>): Identity<U>;
  ap<U>(other: Identity<(x: T) => U> | Identity<any>) {
    if (this.value instanceof Function) {
      return Identity.of<U>(this.value(other.value));
    }
  }
}
```

## `Applicative`

여기가 진짜 난관이었다.  
왜냐면 `Applicative` 의 `of` 메소드는 `static` 이어야 했는데, TS 는 `static` 속성을 인터페이스에 정의할 수 없기 때문이다.  
처음엔 `interface` 로만 하려다 포기하고 `abstract class` 를 썼었다.  
근데 `abstract class` 여도 `static` 속성은 무조건 구현이 되어있어야 했다.  
결국 한참을 찾다가 [`interface` 의 `static` 속성](https://github.com/microsoft/TypeScript/issues/33892)도, [`abstract static` 속성](https://github.com/microsoft/TypeScript/issues/34516)도 구현이 불가능하다는 이슈만 나왔다.  
이것 때문에 몇 시간을 날렸다 진짜...  
책에서도 정의 안 하고 넘어가길래 뭔가 했는데...
아직 TS 가 많이 부족하긴 한가 보다.  
지난 번 고차 타입도 그렇고... ㅠㅠ  
아무튼 [다른 우회 방법](https://stackoverflow.com/questions/13955157/how-to-define-static-property-in-typescript-interface)을 찾아서 적용했다.  
요지는 상위 인터페이스를 만들어 `static` 속성을 정의하고, 해당 인터페이스의 생산자에서 기존에 상속 받았어야할 구현체를 상속받는 것이다.

```ts
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
```

구현 시에는 먼저 다음과 같은 클래스 데코레이션을 먼저 정의해야했다.

```ts
function staticImplements<T>() {
  return <U extends T>(constructor: U) => {};
}
```

그리고 해당 데코레이션의 제네릭 타입에 `Applicative` 를 넣고 `Identity` 클래스에 씌웠다.

```ts
@staticImplements<Applicative<unknown>>()
class Identity<T> implements Setoid<T> {
  ...
  static of<T>(value: T): Identity<T> {
    return new Identity<T>(value);
  }
}
```

## `Chain`

`Chain` 인터페이스도 책과 [규격](https://github.com/fantasyland/fantasy-land#chain)이 다른 부분이 있어 규격을 위주로 정의했다.

```ts
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
```

구현은 타입만 빼면 책과 동일하다.

```ts
@staticImplements<Applicative<unknown>>()
class Identity<T> implements Setoid<T> {
  ...
  chain<U>(arg0: (x: T) => Identity<U>): Identity<U> {
    return arg0(this.value);
  }
}
```

## `Monad`

최종적으로 `Monad` 인터페이스를 정의했다.  
`Monad` 자체는 `Applicative` 만 상속 받고 `Chain` 생성자의 반환값으로 정의했다.

```ts
/**
 * @link https://github.com/fantasyland/fantasy-land#monad
 */
interface Monad<T> extends Applicative<T> {
  new (init: T): Chain<T>;
}
```

구현은 지금까지 해온 코드에 `staticImplements` 타입 인자를 `Monad` 로 바꾸는 것만 하면 됐다.

```ts
@staticImplements<Monad<unknown>>()
class Identity<T> implements Setoid<T> { ... }
```

## 왼쪽 법칙과 오른쪽 법칙

책과 마찬가지로 왼쪽 법칙과 오른쪽 법칙이 만족함을 코드로 보였다.

```ts
const add = (x: number) => (y: number) => x + y;
const inc = (x: number) => Identity.of(x).map(add(1));
const one = Identity.of(1);
console.log(one.chain(inc).equals(inc(1)));
console.log(one.chain(Identity.of).equals(one));
```

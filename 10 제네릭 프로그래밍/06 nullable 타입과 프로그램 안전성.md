# nullable 타입과 프로그램 안전성

- [nullable 타입과 프로그램 안전성](#nullable-타입과-프로그램-안전성)
  - [nullish](#nullish)
  - [nullish 연산자](#nullish-연산자)
  - [옵셔널 체이닝 연산자](#옵셔널-체이닝-연산자)
  - [nullable 방지](#nullable-방지)
  - [`Option` 클래스를 통한 예외처리](#option-클래스를-통한-예외처리)

## nullish

nullish 란 값이 지정되지 않은 상태를 의미한다.  
JS 에는 `null` 과 `undefined` 두 가지의 nullish 타입이 존재한다.  
해당 타입들은 프로그램 오류의 주 원인 중 하나이다.  
이를 잘 관리해야 프로그램 안전성을 높일 수 있다.

## nullish 연산자

기존에 nullish 값을 구분하기 위해 사용하던 `||` 연산자를 이용했다.  
하지만 `||` 연산자는 좌항이 falsy 값일 때 우항을 반환한다.  
이로 인해 `0`, `''`, `false` 등의 falsy 값도 nullish 값으로 인식되어 버렸다.  
이를 위해 JS 에서는 `??` 연산자를 도입했다.  
`??` 연산자는 좌항이 `null` 또는 `undefined` 일 때만 우항을 반환한다.

```ts
const isFalsy = (value: any) => value || 'falsy';
const isNullish = (value: any) => value ?? 'nullish';
console.log(isFalsy(0), isFalsy(null)); // falsy falsy
console.log(isNullish(0), isNullish(null)); // 0 nullish
```

추가적으로 `??=` 연산자도 있다.  
`+` 와 `+=` 의 관계와 동일하므로 설명은 생략한다.

## 옵셔널 체이닝 연산자

또 객체의 속성이 nullish, 즉 옵션 값인 경우 를 위한 옵셔널 체이닝 연산자도 도입되었다.  
`?.` 연산자는 해당 객체의 속성의 속성의 속성의 ... 속성을 참조할 때 중간에 nullish 값이 있으면 undefined 를 반환한다.

```ts
const obj = { a: { b: { c: 1 }}};
console.log(obj?.a?.b?.c); // 1
console.log(obj?.a?.d?.c); // undefined
```

## nullable 방지

상기했듯 nullish 값을 잘 관리해야 프로그램 안전성을 높일 수 있다.  
이를 위해 위와 같은 연산자도 도입된 것이다.

함수형 프로그래밍에는 `Maybe`, `Option(al)` 등으로 불리는 nullable 방지를 위한 타입이 존재한다.  
책에서는 `Option` 이란 이름을 사용했으므로 나도 동일하게 사용하겠다.  
이를 위해서는 먼저 두개의 타입을 정의해야한다.  
`Valuable` 타입은 기본값을 받아 현재 값이 nullish 여도 기본값을 반환하는 `getOrElse` 메소드를 가진 인터페이스이다.  
`Functor` 타입은 특정 타입을 다른 타입으로 바꾸는 함수를 인자로 받는 `map` 메소드를 가진 인터페이스이다.

```ts
interface Valuable<T> {
  getOrElse: (defaultValue: T) => T;
}
interface Functor<T> {
  map: <U>(fn: (value: T) => U) => Functor<U>;
}
```

또 nullable 값을 처리하기 위한 `nullable`, `Nullable<T>` 타입을 정의한다.

```ts
type nullable = null | undefined;
type Nullable<T> = T | nullable;
```

`Option` 클래스를 정의하기 위해서는 상기한 두 인터페이스를 구현한 `Some`, `None` 클래스를 정의해야한다.  
`Some` 클래스는 두 메소드 모두 정상적으로 작동해야한다.

```ts
class Some<T> implements Valuable<T>, Functor<T> {
  constructor(private value: T) {}
  getOrElse(defaultValue: T) {
    return this.value ?? defaultValue;
  }
  map<U>(fn: (value: T) => U) {
    return new Some<U>(fn(this.value));
  }
}
```

`None` 클래스는 말 그대로 값이 없는 경우이다.  
따라서 `getOrElse` 메소드는 항상 기본값을 반환하고, `map` 메소드는 항상 `None` 을 반환해야한다.

```ts
class None implements Valuable<nullable>, Functor<nullable> {
  getOrElse<T>(defaultValue: T | nullable) {
    return defaultValue;
  }
  map(fn: (value: any) => any) {
    return new None();
  }
}
```

이제 최종적으로 `Option` 클래스를 정의할 수 있다.

```ts
class Option {
  private constructor() {}
  static Some<T>(value: T) {
    return new Some<T>(value);
  }
  static None = new None();
}
```

## `Option` 클래스를 통한 예외처리

내장 함수 `parseInt` 는 문자열을 숫자로 변환해주는 함수이다.  
하지만 문자열이 뉴메릭 타입이 아닌 경우 `NaN` 을 반환한다.  
`Option` 클래스를 통해 예외처리를 한 `parseNum` 함수를 다음과 같이 구현해 줄 수 있다.

```ts
const parseNum = (str: string): Some<number> | None => {
  const num = parseInt(str);
  return isNaN(num) ? Option.None : Option.Some(num);
};
const addToOption = (num: number) => (option: Some<number> | None) =>
  option.map((x) => x + num);
const getValue = (option: Some<number> | None) => option.getOrElse(0);
console.log(...["1", "a"].map(parseNum).map(addToOption(1)).map(getValue)); // 2 0
```

이와 같이 에러든 정상적인 값이든 일괄적으로 처리할 수 있다.  
참고로 보다시피 배열에도 `map` 메소드가 존재한다.  
즉 `Functor` 인터페이스를 만족하는 것이다.  
아마 이에 대해 곧 나오지 않을까 싶다.

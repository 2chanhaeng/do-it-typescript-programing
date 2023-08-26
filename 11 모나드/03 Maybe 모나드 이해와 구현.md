# Maybe 모나드 이해와 구현

- [Maybe 모나드 이해와 구현](#maybe-모나드-이해와-구현)
  - [`Maybe`](#maybe)
  - [`Just`](#just)
  - [`Nothing`](#nothing)
  - [`Maybe` 구현](#maybe-구현)
  - [`Maybe` 예제](#maybe-예제)

## `Maybe`

`Maybe` 는 예외 처리를 간결하게 하기 위한 클래스이다.  
`Maybe` 는 `Just` 와 `Nothing` 라는 `Monad` 로 이루어져 있다.  
이전에 `Monad` 타입을 구현함을 나타내기 위해 `staticImplements` 라는 데코레이터를 사용했었다.  
이번에는 아예 둘을 합쳐서 번거로움을 줄였다.

```ts
const Monad = staticImplements<Monad<unknown>>();
// 지금 지정한 `Monad` 는 실제 값(함수)이고 제네틱 타입 속 `Monad` 는 타입이기 때문에 문제 없이 동작한다.
```

추가적으로 `Maybe` 는 데이터를 일괄적으로 처리하는 것이 목적이다.  
그렇기 때문에 다음과 같은 `IMaybe` 인터페이스를 정의하여 `Just` 와 `Nothing` 에 이를 구현할 것이다.

```ts
interface IMaybe<T> {
  get isJust(): boolean;
  get isNothing(): boolean;
  getOrElse<U>(arg0: U): T | U;
}
```

## `Just`

`Just` 는 `Identity` 와 동일하게 어떤 값을 가지고 있는 `Monad` 이다.  
다만 `getOrElse` 메소드를 주로 사용하는 점을 염두해두고 구현하였다.  
추가로 책에서는 `ap` 메소드에서 실제로 인자가 함수인지를 확인하는 부분이 있었다.  
나는 함수 인자의 타입 검사만 하도록 하고 넘어갔다.

```ts
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
```

## `Nothing`

`Nothing` 은 `Just` 와 달리 어떤 값을 가지고 있지 않은 `Monad` 이다.  
예외로 처리시켜 코드를 실행하지 않는 것이 목적이다.

```ts
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
```

## `Maybe` 구현

`Maybe` 클래스는 지금까지 구현한 `Just` 와 `Nothing` 을 정적 속성으로 가지고 있는게 다이다.

```ts
export class Maybe {
  static Just = <T>(value: T) => Just.of<T>(value);
  static Nothing = new Nothing();
}
```

## `Maybe` 예제

책에서는 `Maybe` 의 사용 예시로 다음과 같은 코드를 제시한다.  
척 노리스라는 영화 배우를 주제로 한 유머 사이트에서 JSON 데이터를 가져와 파싱하는 코드이다.  
참고로 책에 있는 URL(https://api.icndb.com/...)은 현재 작동하지 않는다.  
찾아보니 [여기](https://api.chucknorris.io/jokes/random)로 주소를 바꾼 것 같다.

```ts
const url = "https://api.chucknorris.io/jokes/random";
```

해당 사이트에 들어가보니 `api` 에서 보내주는 데이터의 구조가 나와있었다.  
그 내용을 바탕으로 먼저 `Joke` 타입의 인터페이스를 정의했다.

```ts
interface Joke {
  categories?: string[];
  created_at?: string;
  icon_url?: string;
  id?: string;
  updated_at?: string;
  url?: string;
  value: string;
}
```

`Maybe` 는 예외 처리를 위한 것이기 때문에 통신이 제대로 되지 않은 경우 또한 필요하다.  
이를 위해 책에는 없지만 80% 확률로만 제대로 된 URL을 반환하는 함수를 정의했다.

```ts
function urlOrNothing() {
  return Math.random() < 0.8 ? url : "";
}
```

이후 데이터를 받아오는 비동기 함수를 정의했다.  
데이터를 받아오고 이를 JSON으로 파싱한 뒤 파싱한 데이터를 `Maybe` 로 감싸서 반환한다.  
만약 이 중 한 과정이라도 실패하면 `Maybe.Nothing` 을 반환한다.

```ts
async function fetchJoke() {
  try {
    const url = urlOrNothing();
    const data = await fetch(url);
    const json = await data.json();
    return Maybe.Just<Joke>(json);
  } catch {
    return Maybe.Nothing;
  }
}
```

이후 `ramda` 의 `lensProp`, `view` 를 이용해서 `value` getter를 정의했다.

```ts
const getValue = view(lensProp("value"));
```

마지막으로 가져온 값을 출력하는 함수를 정의했다.

```ts
async function logJoke() {
  const joke = await fetchJoke();
  joke.map(getValue).map(console.log);
}
```

이후 여러번 실행해보았다.

```ts
Array(10)
  .fill(0)
  .forEach(() => logJoke());

/* 해당 결과는 랜덤 값이기 때문에 실행할 때마다 다르다.
  Chuck Norris once got in a bullfight with a matador.
  Once, Chuck Norris ate 200 grapes, and peed out wine.
  Chuck Norris has survived in every possible geographic location on Earth, as well as 7 on the moon and 2 on Mars.
  Michael Jackson didn't have a rare skin disease.... Chuck Norris beat the black outa him.. ..at Michael's request. The injuries were so severe it required several years of intense surgery.
  When Chuck Norris kills you, the government fully covers all funeral expenses, as ordered by the UN. It is the only truly good thing they have ever done.
  Chuck Norris is the reasion why mexicans cross the border
  Rambo is actually just a cheap Chinese knock-off of Chuck Norris.
  Chuck Norris built a better mousetrap, but the world was too frightened to beat a path to his door.
  Chuck Norris does not make new year resolutions the new year makes Chuck Norris resolutions.
*/
```

오류가 났던 한 번을 제외하면 정상적으로 출력되는 것을 확인할 수 있다.

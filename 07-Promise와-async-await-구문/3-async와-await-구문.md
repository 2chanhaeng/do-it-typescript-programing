# async와 await 구문

- [async와 await 구문](#async와-await-구문)
  - [async/await](#asyncawait)
  - [주의사항](#주의사항)

## async/await

콜백 지옥에 비하면 `Promise` 문법도 많이 편해졌다.  
하지만 `Promise` 문법도 가독성 측면에서 부족한 점이 많다.  
이를 위해 `async/await` 구문이 등장했다.  
이전의 `readFilePromise` 을 `async/await` 구문으로 바꿔보자.

```ts
import { readFile } from 'fs';

const readFilePromise =  ...; // `async/await` 는 `Promise` 를 대체하는 것이 아니다.
// 어디까지나 기존 문법을 사용하기 쉽도록 만들어주는 것이므로 `Promise` 가 필요하다.
// `async` 는 `Promise` 를 반환하는 함수를 만들어주고,
// `await` 는 `Promise` 에서 `resolve` 에 값이 도달하기를 기다렸다가 값을 반환해주는 역할을 한다.

async function logHello() {
  const hello = await readFilePromise('hello.txt'); //  'hello.txt' 의 내용이 담긴다.
  console.log(hello);
}

logHello(); // 'hello.txt' 의 내용이 출력된다.
console.log(logHello() instanceof Promise); // true
```

## 주의사항

`await` 키워드는 `async` 함수와 모듈의 최상위 스코프에서만 사용할 수 있다.  
예를 들어서 `main.ts` 에서 최상위 스코프에 `await` 를 사용하고 `main.ts` 함수를 직접 실행하면 에러가 발생한다.  
해당 코드를 `async` 함수로 만들거나, 모듈로 분리해서 `main.ts` 에서 `import` 해서 사용하면 정상적으로 동작한다.

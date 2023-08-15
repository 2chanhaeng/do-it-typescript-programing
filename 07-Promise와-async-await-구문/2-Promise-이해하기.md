# Promise 이해하기

- [Promise 이해하기](#promise-이해하기)
  - [`Promise`](#promise)
  - [`fs.readFile`](#fsreadfile)

## `Promise`

`Promise` 는 비동기 처리를 위한 객체이다.  
자세한 사용법이나 메소드는 1-2에서 설명했으니 넘어가도록 하겠다.

## `fs.readFile`

책에서는 `Promise` 의 용례로 `fs.readFile` 를 `Promise` 객체로 변환하는 과정을 제시했다.

```ts
import { readFile } from "fs";

const readFilePromise = (filename: string): Promise<string> =>
  new Promise((resolve, reject) => {
    readFile(filename, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer.toString());
    });
  });

readFilePromise("hello.txt").then((content) => {
  console.log(content);
});
```

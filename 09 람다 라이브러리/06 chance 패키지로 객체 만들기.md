# chance 패키지로 객체 만들기

## `chance` 패키지

`chance` 패키지는 랜덤한 값을 생성해주는 패키지이다.  
책에서 실습을 위해 추가로 설치했다.  
이번 장에서는 해당 라이브러리에 대해 간단한 사용법을 다룬다.

## `chance` 패키지 예시

책에서는 직접 객체를 만드는 객체 팩토리를 만들어서 사용했다.  
나는 인터페이스와 이를 구현하는 클래스 방식으로 구현해봤다.

```ts
import Chance from "chance";

const c = new Chance();

interface ICoordinates {
  latitude: number;
  longitude: number;
}

class Coordinates implements ICoordinates {
  constructor(
    public latitude: number = c.latitude(),
    public longitude: number = c.longitude()
  ) {}
}

interface ILocation {
  coordinates: ICoordinates;
  country: string;
  city: string;
  address: string;
}

class Location implements ILocation {
  constructor(
    public coordinates: ICoordinates = new Coordinates(),
    public country: string = c.country(),
    public city: string = c.city(),
    public address: string = c.address()
  ) {}
}

interface IPerson {
  name: string;
  age: number;
  title: string;
  location: ILocation;
}

class Person implements IPerson {
  constructor(
    public name: string = c.name(),
    public age: number = c.age(),
    public title: string = c.profession(),
    public location: ILocation = new Location()
  ) {}
}
```

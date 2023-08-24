interface IValuable<T> {
  value: T;
}

class Valuable<T> implements IValuable<T> {
  constructor(public value: T) {}
}

const printValue = <T>({ value }: IValuable<T>) => console.log(value);
const v = new Valuable(1);
printValue(v); // 1

interface BaseShape {
  type: "circle" | "ractangle" | "triangle";
}
interface Circle extends BaseShape {
  radius: number;
  type: "circle";
}
interface Ractangle extends BaseShape {
  width: number;
  height: number;
  type: "ractangle";
}
interface Triangle extends BaseShape {
  width: number;
  height: number;
  type: "triangle";
}

type Shape = Circle | Ractangle | Triangle;

const area = (shape: Shape) => {
  switch (shape.type) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "ractangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.width * shape.height) / 2;
  }
};

interface BaseInterface {
  type: "some" | "other";
}
interface SomeInterface extends BaseInterface {
  type: "some";
  a: number;
}
interface OtherInterface extends BaseInterface {
  type: "other";
  b: string;
}

const logIfSomeInterface = (a: SomeInterface | OtherInterface) => {
  if (a.type === "some") {
    console.log(a);
  }
};

const isSomeInterface = (a: unknown): a is SomeInterface => {
  return (a as SomeInterface).type === "some" ? true : false;
};

const logIfSomeInterface2 = (a: SomeInterface | OtherInterface) => {
  if (isSomeInterface(a)) {
    console.log(a);
  }
};

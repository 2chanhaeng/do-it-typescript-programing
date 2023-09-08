import { readFileSync } from "fs";
import {
  zipObj,
  curryN,
  flip,
  map,
  pipe,
  split,
  tail,
  head,
  ap,
  compose,
  uncurryN,
  ifElse,
  has,
  identity,
  always,
} from "ramda";

export const readCSV = pipe(
  curryN(2)(flip(readFileSync))("utf8") as (path: string) => string,
  split("\n"),
  map(split(",")),
  ifElse(has(0), identity, always([[]])) as (
    x: string[][]
  ) => [string[], ...string[][]],
  ap(
    uncurryN<{ [K: string]: string }[]>(2)(
      compose<
        [[string[], ...string[][]]],
        string[],
        (values: string[]) => { [K: string]: string },
        (values: string[][]) => { [K: string]: string }[]
      >(map, zipObj, head)
    ),
    tail
  )
);

const data = readCSV("data.csv");
console.log(data.length, data[0]);

import Chance from "chance";
import { readFile, writeFileSync } from "fs";
import {
  join,
  map,
  prepend,
  repeat,
  prop,
  apply,
  flip,
  bind,
  compose,
} from "ramda";

const c = Chance();
export const writeCSV =
  (
    header: (keyof Chance.Chance)[],
    delimiter: string = ",",
    lineterminator: string = "\n"
  ) =>
  (n: number) =>
  (path: string) =>
    writeFileSync(
      path,
      compose(
        join(lineterminator),
        map(join(delimiter)),
        prepend(header),
        map(map(flip(apply)([]))),
        repeat(map(compose(flip(bind)(c), flip(prop)(c)))(header))
      )(n)
    );
/*
// data.csv 바로 체크
writeCSV(["name", "email", "birthday", "address", "phone"])(1000)("data.csv");
readFile("data.csv", "utf8", (_, data) =>
  console.log(data.split("\n").slice(1, 3).join("\n"))
);
*/

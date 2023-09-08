import Chance from "chance";
import { readFile, writeFileSync } from "fs";

const c = Chance();
type Header = ["name", "email", "birthday", "address", "phone"];
const header: Header = ["name", "email", "birthday", "address", "phone"];
const createCSV = (n: number) =>
  [
    header.join(","),
    ...Array(n)
      .fill(0)
      .map(() => header.map((x) => c[x]()).join(",")),
  ].join("\n");
export const writeCSV = (path: string) => (n: number) =>
  writeFileSync(path, createCSV(n));
/*
// data.csv 바로 체크
writeCSV(["name", "email", "birthday", "address", "phone"])(1000)("data.csv");
readFile("data.csv", "utf8", (_, data) =>
  console.log(data.split("\n").slice(1, 3).join("\n"))
);
*/

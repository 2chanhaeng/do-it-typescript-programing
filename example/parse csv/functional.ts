import { readFileSync } from "fs";

export function readCSV(path: string) {
  const splitRaw = (path: string) =>
    readFileSync(path, "utf8")
      .split("\n")
      .map((x) => x.split(","));
  const [header, ...body] = splitRaw(path);
  const zipHeader = (arr: string[]) => header.map((x, i) => [x, arr[i]]);
  const parceCSV = (body: string[][]) =>
    body.map((line) => Object.fromEntries(zipHeader(line)));
  return parceCSV(body);
}
const data = readCSV("data.csv");
console.log(data.length, data[0]);

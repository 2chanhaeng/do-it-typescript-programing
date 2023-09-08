import { readFileSync } from "fs";

const path = "data.csv";
const raw = readFileSync(path, "utf8");
type Data = {
  name: string;
  email: string;
  birthday: string;
  address: string;
  phone: string;
};
const lines = raw.split("\n");
const header = lines.pop()!.split(",") as (keyof Data)[];
const data: Data[] = [];
for (const line of lines) {
  const rowArray = line.split(",");
  const rowObject: Data = {} as Data;
  for (const [index, value] of rowArray.entries()) {
    rowObject[header[index]] = value;
  }
  data.push(rowObject);
}
console.log(data.length, data[0]);

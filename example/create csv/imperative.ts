import Chance from "chance";
import { writeFileSync } from "fs";

const n = 1000;
const c = Chance();
const header: ["name", "email", "birthday", "address", "phone"] = [
  "name",
  "email",
  "birthday",
  "address",
  "phone",
];
let data = "";
for (const col of header) {
  data += col + ",";
}
data = data.slice(0, -1) + "\n";
for (let i = 0; i < n; i++) {
  let row = "";
  for (const key of header) {
    row += c[key]() + ",";
  }
  data += row.slice(0, -1) + "\n";
}
writeFileSync("data.csv", data);

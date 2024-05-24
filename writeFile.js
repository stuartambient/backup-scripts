import fs from "fs";
import JSONStream from "JSONStream";

const fileStream = fs.createWriteStream("output.json", { flags: "a" }); // 'a' for append
const jsonStream = JSONStream.stringify("[\n", ",\n", "\n]\n"); // false means no array brackets, just JSON objects

jsonStream.pipe(fileStream);

const writeFile = item => {
  jsonStream.write(item);
  console.log("JSON object written to file.");
};

export default writeFile;

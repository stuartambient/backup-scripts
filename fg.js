import fs from "node:fs";
import fg from "fast-glob";
import path from "node:path";
const entries1 = [];
const entries2 = [];
const files = async () => {
  const stream = fg.stream("D:/G_MUSIC/**", { onlyDirectories: true });

  for await (const entry of stream) {
    entries1.push(entry);
  }
  /*   for await (const e of entries) {
    console.log(e);
  } */
  /*   return console.log("fg: ", entries.length); */
};

/* files(); */
/* readDirs(); */

/* const getAllDirectories = dir =>
  fs
    .readdirSync(dir)
    .reduce(
      (dirs, file) =>
        fs.statSync(path.join(dir, file)).isDirectory()
          ? [...entries2, ...getAllDirectories(path.join(dir, file))]
          : entries2,
      [dir]
    );

getAllDirectories("D:/G_Music"); */
files();

console.log(entries1.length, entries2.length);

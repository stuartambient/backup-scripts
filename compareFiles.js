import fs from "node:fs";
import path from "node:path";

const dirPath = process.argv[2];
async function readDirRecursive(dirPath) {
  const queue = [dirPath];
  const result = [];

  while (queue.length > 0) {
    const currentDirPath = queue.shift();

    const files = await fs.promises.readdir(currentDirPath);

    for (const file of files) {
      const filePath = path.join(currentDirPath, file);
      const stat = await fs.promises.stat(filePath);

      if (stat.isDirectory()) {
        queue.push(filePath);
      } else {
        result.push(filePath);
      }
    }
  }

  console.log(result.length);
}

readDirRecursive();

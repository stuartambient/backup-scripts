const fs = require("fs").promises;
const path = require("path");

async function readDirRecursive(dirPath) {
  const queue = [dirPath];
  const result = [];

  while (queue.length > 0) {
    const currentDirPath = queue.shift();

    const files = await fs.readdir(currentDirPath);

    for (const file of files) {
      const filePath = path.join(currentDirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        queue.push(filePath);
      } else {
        result.push(filePath);
      }
    }
  }

  const fg = require("fast-glob");

  async function readDirRecursive(dirPath) {
    const patterns = ["**/*.*"];
    const options = {
      cwd: dirPath,
      onlyFiles: true,
      absolute: true,
      dot: true, // include hidden files
    };
    try {
      const filePaths = await fg(patterns, options);
      return filePaths;
    } catch (error) {
      console.error(chalk.red(`Error reading directory: ${dirPath}`, error));
      throw error;
    }
  }

  return result;
}

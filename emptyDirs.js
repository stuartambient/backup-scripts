import fs from "fs-extra";
import path from "path";

async function isEmptyDir(directoryPath) {
  // Check if the directory exists
  if (!fs.existsSync(directoryPath)) {
    throw new Error(`Directory does not exist: ${directoryPath}`);
  }

  // Read the contents of the directory
  const files = await fs.promises.readdir(directoryPath);

  // Check if the directory is empty
  if (files.length === 0) {
    console.log(directoryPath);
    return true;
  }

  // Check if the directory only contains subdirectories that are also empty
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = await fs.promises.stat(filePath);
    if (stats.isDirectory() && !(await isEmptyDir(filePath))) {
      return false;
    }
  }

  return true;
}

// Example usage
const directoryPath = "G:/G_Music_Backup";
isEmptyDir(directoryPath)
  .then(isDirectoryEmpty => {
    console.log(`Is directory empty? ${isDirectoryEmpty}`);
  })
  .catch(error => {
    console.error(error);
  });

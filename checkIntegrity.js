import fs from "fs";
import path from "path";
import crypto from "crypto";
import { program } from "commander";

program
  .version("1.0.0")
  .requiredOption("-d, --directory <type>", "Directory path");
program.parse(process.argv);

const options = program.opts();

// Function to calculate the SHA-256 hash of a file
function calculateHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("error", err => reject(err));
    stream.on("data", chunk => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

// Function to recursively get all files from a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

async function checkDirectoryIntegrity(dirPath) {
  try {
    const files = getAllFiles(dirPath);
    for (const file of files) {
      const hash = await calculateHash(file);
      console.log(`File: ${file}, SHA-256: ${hash}`);
    }
  } catch (err) {
    console.error(`Error processing directory: ${err.message}`);
  }
}

// Check integrity of each file in the provided directory
checkDirectoryIntegrity(options.directory);

import fs from "fs";
import path from "path";
import { exec } from "child_process";

// Function to get file metadata using ffprobe
function getFileMetadata(filePath) {
  return new Promise((resolve, reject) => {
    exec(
      `ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate,bit_rate -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      (err, stdout, stderr) => {
        if (err) {
          reject(stderr);
        } else {
          const [sampleRate, bitRate] = stdout.trim().split("\n").map(Number);
          resolve({ sampleRate, bitRate });
        }
      }
    );
  });
}

// Function to process a file with FFmpeg and create a copy
async function processFile(filePath) {
  try {
    const metadata = await getFileMetadata(filePath);
    const { sampleRate, bitRate } = metadata;

    // Debugging log
    console.log(
      `File: ${filePath}, Sample Rate: ${sampleRate}, Bitrate: ${bitRate}`
    );

    if (!bitRate || !sampleRate) {
      throw new Error(`Invalid metadata for file: ${filePath}`);
    }

    const fileDir = path.dirname(filePath);
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath, fileExt);
    const copyFilePath = path.join(fileDir, `${fileName}_copy${fileExt}`);

    // Determine the quality level for VBR based on the original bitrate for MP3
    const qualityLevel = bitRate >= 270000 ? 0 : bitRate >= 260000 ? 1 : 2;

    return new Promise((resolve, reject) => {
      let command;
      if (fileExt === ".mp3") {
        command = `ffmpeg -hide_banner -loglevel error -i "${filePath}" -q:a ${qualityLevel} -ar ${sampleRate} "${copyFilePath}"`;
      } else if (fileExt === ".flac") {
        command = `ffmpeg -hide_banner -loglevel error -i "${filePath}" -c:a copy "${copyFilePath}"`;
      } else {
        reject(new Error(`Unsupported file extension: ${fileExt}`));
        return;
      }

      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error processing ${filePath}:`, stderr);
          reject(err);
        } else {
          console.log(`Created copy: ${copyFilePath}`);
          resolve();
        }
      });
    });
  } catch (error) {
    console.error(`Failed to process ${filePath}:`, error.message);
  }
}

// Function to process multiple files in a folder
async function processFilesInFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    const supportedExtensions = [".mp3", ".flac", ".ogg", ".ape"];

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileExt = path.extname(file).toLowerCase();

      // Process only supported audio files
      if (supportedExtensions.includes(fileExt)) {
        try {
          await processFile(filePath);
          console.log(`Processed and copied: ${file}`);
        } catch (error) {
          console.error(`Failed to process ${file}:`, error.message);
        }
      } else {
        console.log(`Skipping unsupported file: ${file}`);
      }
    }
  } catch (error) {
    console.error("Error reading folder:", error.message);
  }
}

// Specify the folder containing the audio files
const folderPath = "J:/Nicolas Rada - The Wind Phone";

// Start processing files
processFilesInFolder(folderPath);

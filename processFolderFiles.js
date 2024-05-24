import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

// Function to get file metadata using ffprobe
// Function to get file metadata using ffprobe
function getFileMetadata(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

// Function to check if the file uses VBR
function isVBR(metadata) {
  const audioStream = metadata.streams.find(
    stream => stream.codec_type === "audio"
  );
  return audioStream && audioStream.tags && audioStream.tags.VBR;
}

// Function to process a file with FFmpeg and create a copy
async function processFile(filePath) {
  try {
    const metadata = await getFileMetadata(filePath);
    const fileDir = path.dirname(filePath);
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath, fileExt);
    const copyFilePath = path.join(fileDir, `${fileName}_copy${fileExt}`);

    const audioStream = metadata.streams.find(
      stream => stream.codec_type === "audio"
    );
    const bitrate = Math.round(audioStream.bit_rate / 1000); // Convert to kbps
    const sampleRate = audioStream.sample_rate;

    return new Promise((resolve, reject) => {
      const command = ffmpeg(filePath)
        .output(copyFilePath)
        .audioFrequency(sampleRate)
        .on("end", () => {
          console.log(`Created copy: ${copyFilePath}`);
          resolve();
        })
        .on("error", err => {
          console.error(`Error processing ${filePath}:`, err.message);
          reject(err);
        });

      if (isVBR(metadata)) {
        command.audioQuality(0); // VBR setting
      } else {
        command.audioBitrate(`${bitrate}k`); // CBR setting, ensuring correct format
      }

      command.run();
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
const folderPath = "D:/G_MUSIC/Komet - Saat";

// Start processing files
processFilesInFolder(folderPath);

import { exec } from "node:child_process";

import { File, MpegAudioFile } from "node-taglib-sharp";
import { parseFile } from "music-metadata";

const getFileInfo = path => {
  return new Promise((resolve, reject) => {
    // ffmpeg command to get detailed file information
    //const command = `ffmpeg -i "${path}" -hide_banner`;
    //const command = `ffmpeg -v error -i "${path}" -f null -`;
    const command = `ffprobe -v error -show_format -show_streams "${path}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        // ffmpeg outputs to stderr for this type of info
        resolve(error);
        if (stderr) {
          resolve(stderr); // Resolving with stderr since it contains the info
        } else {
          reject(error);
        }
      } else {
        resolve(stdout);
      }
    });
  });
};

/* getFileInfo("D:/G_MUSIC/Coil - Black Gold/b01-egyptian_basses.mp3")
  .then(info => {
    console.log("File Information:", info);
  })
  .catch(err => {
    console.error("Error getting file information:", err.message);
  }); */

const checkFile = () => {
  const myfile = File.createFromPath(
    "J:/corrupted-files/The Nylons - One Size Fits All/03 - Town Without Pity.flac.mp3"
  );

  console.log(myfile.tag);
  /*   console.log(myfile.properties.audioBitrate);
  console.log(myfile.tag.tags); */
  /*  console.log(myfile.tag.pictures); */
};

checkFile();
/* const useMm = async path => {
  try {
    const metadata = await parseFile(path);
    console.log("metadata: ", metadata.quality, metadata.native);
  } catch (error) {
    console.log(`Error processing ${path} --- error`);
  }
}; */

//useMm("D:/G_MUSIC/Coil - Black Gold/b01-egyptian_basses.mp3");

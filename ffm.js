import { spawn } from "node:child_process";
import fs, { copy } from "fs-extra";
import path from "path";
import fg from "fast-glob";

/* The result of executing the spawn function 
is a ChildProcess instance, which implements the EventEmitter API. */

async function copyFile(sourcePath, destPath) {
  const sourceStream = fs.createReadStream(sourcePath);
  const destStream = fs.createWriteStream(destPath);

  return new Promise((resolve, reject) => {
    sourceStream.on("error", reject);
    destStream.on("error", reject);
    destStream.on("finish", resolve);

    sourceStream.pipe(destStream);
  });
}

const readDir = async () => {
  const files = await fg(`J:/testfolder/**/*.*`);

  for await (const file of files) {
    const directory = file.slice(0, file.lastIndexOf("/"));
    const filename = path.basename(file);

    const fileExtension = path.extname(file);
    const baseFileName = path.basename(filename);
    const copyFileName =
      baseFileName.replace(fileExtension, "") + " - copy" + fileExtension;

    console.log(baseFileName, "------", copyFileName);

    /*    const originalFilePath = path.join(directory, filename);
    const copyFilePath = path.join(directory, copyFileName);

    console.log(originalFilePath, "----", copyFilePath); */

    /* await copyFile(originalFilePath, copyFilePath); */

    /* await copyFile(file, `${file} - copy`); */
  }
  return;

  // COPY FILE
  // RENAME OG COPY TEMP
  // REWRITE UPDATE FILE WITH OLD NAME
  // DELETE TEMP
};

/* const child = spawn("ffprobe", [
  "-show_format",
  "-print_format",
  "json",
  "J:/testfolder/Amon - Nona/01 Nona.mp3",
]); */

readDir();

/* child.stdout.on("data", data => {
  console.log(`child stdout:\n${data}`);
});

child.stderr.on("data", data => {
  console.error(`child stderr:\n${data}`);
}); */

/* process.stdin.pipe(child.stdin);

child.stdout.on("data", data => {
  console.log(`child stdout:\n${data}`);
}); */

//Read
/* ffprobe -show_format -print_format json music.mp3

//WRITE
ffmpeg -i aiff.aiff -map 0 -y -codec copy -write_id3v2 1 -metadata "artist-sort=emon feat sort" aiffout.aiff
ffmpeg

ffmpeg -i "01. Loophole.flac" -map 0 -y -codec copy -metadata "genre=electronic
*/

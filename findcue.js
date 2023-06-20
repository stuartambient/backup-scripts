import fs from "fs-extra";
import path from "node:path";
import fg from "fast-glob";

async function readDirRecursive(dirPath) {
  const patterns = ["**/*.cue"];
  const options = {
    cwd: dirPath,
    onlyFiles: true,
    absolute: true,
    dot: true,
  };
  const filePaths = await fg(patterns, options);
  return filePaths;
}

const findCue = async () => {
  let cuefiles = [];
  const dirs = [
    "D:/music",
    "E:/music",
    "F:/Music",
    "D:/G_MUSIC",
    "G:/H_Music_Backup",
    "I:/Music",
  ];

  for await (const d of dirs) {
    let tmp = await readDirRecursive(d);
    cuefiles = [...cuefiles, ...tmp];
  }
  cuefiles.forEach(cf => {
    let tmp = cf.lastIndexOf("/");
    console.log(cf.substring(0, tmp));
  });
  /* console.log('Total found: ', cuefiles.length) */
};

findCue();

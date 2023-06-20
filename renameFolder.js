import fs from "fs";
import path from "path";

const rn = async folder => {
  const newName = folder.replace("Nurse With Wound", "Nurse with Wound");
  const oldpath = path.join("D:/G_music", folder);
  const newpath = path.join("D:/G_music", newName);
  const op = await fs.promises.rename(oldpath, newpath);
};

const startProc = async folders => {
  for await (const f of folders) {
    rn(f);
  }
};

const foldersToChange = folders => {
  const toChange = folders.filter(f => f.includes("Nurse With Wound"));
  return toChange;
};

const getFolders = async path => {
  const folders = await fs.promises
    .readdir(path)
    .then(foldersToChange)
    .then(res => startProc(res));
};

getFolders("D:/G_music");

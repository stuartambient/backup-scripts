import fs from "fs";
import path from "path";

const rn = async folder => {
  const newName = folder.replace("Various Artists -", "Various -");
  const oldpath = path.join("H:/Top/Music", folder);
  const newpath = path.join("H:/Top/Music", newName);
  const op = await fs.promises.rename(oldpath, newpath);
};

const startProc = async folders => {
  for await (const f of folders) {
    rn(f);
  }
};

const foldersToChange = folders => {
  const toChange = folders.filter(f => f.includes("Various Artists -"));
  return toChange;
};

const getFolders = async path => {
  const folders = await fs.promises
    .readdir(path)
    .then(foldersToChange)
    .then(res => startProc(res));
};

getFolders("H:/Top/Music");

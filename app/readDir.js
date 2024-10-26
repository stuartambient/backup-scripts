import fs from "node:fs/promises";
import fg from "fast-glob";

const read = async () => {
  const accented = await fs.readdir(
    "I:/music/Parliament Funkadelic - The Mind of thte Universe (Live Passaic '78 WDHA)"
  );
  console.log(accented);
};

const readFg = () => {
  const escapedPath = fg.escapePath(
    "I:/music/Parliament Funkadelic - The Mind of thte Universe (Live Passaic '78 WDHA)"
  );
  const x = fg.sync(`${escapedPath}/*.jpg`);
  console.log(x);
};

readFg();

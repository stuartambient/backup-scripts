import fg from "fast-glob";
import { readdir } from "node:fs/promises";

let dirs = [];

function escapeSpecialChars(path) {
  return path.replace(/[\[\]\(\)\{\}]/g, "\\$&");
}

const options = {
  caseSensitiveMatch: false,
  suppressErrors: false,
  dot: true,
};

async function searchCover(folder) {
  //console.log(folder);
  const escapedPath = escapeSpecialChars(folder);
  //const cover = await fg(`${escapedPath}/**/*.{jpg,jpeg,png,webp}`, options);
  const cover = await fg("**/*.{jpg,jpeg,png,webp}", { cwd: folder });
  console.log("cover: ", cover);
  if (cover.length > 0) {
    //if (cover[0].endsWith("png")) {
    console.log("cover: ", `${folder}/${cover[0]}`);
    //}

    return cover[0];
  }
  return;
}

const run = (root, dirs) => {
  for (const dir of dirs) {
    searchCover(`${root}/${dir}`);
  }
};

const readDir = async path => {
  try {
    dirs = await readdir(path);
    run(path, dirs);
  } catch (error) {
    console.log("error: ", error);
  }
};

/* readDir("H:/Music"); */

searchCover("I:/music/Tomorrow's Fashions - Library Electronica 1972~1987");

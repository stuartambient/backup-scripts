import { stat } from "node:fs/promises";
import fs, { copy } from "fs-extra";
import path from "path";
import fg from "fast-glob";
import ffmpeg from "fluent-ffmpeg";
import writeFile from "./writeFile.js";

import { File, Tag, Picture, TagTypes, Genres } from "node-taglib-sharp";

/* console.log("tag types: ", TagTypes); */

function processFile(filePath) {
  return new Promise((resolve, reject) => {
    const fileDir = path.dirname(filePath);
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath, fileExt);
    const copyFilePath = path.join(fileDir, `${fileName}_copy${fileExt}`);

    ffmpeg(filePath)
      .audioCodec("flac")
      .output(copyFilePath)
      .on("end", () => {
        console.log(`Created copy: ${copyFilePath}`);
        resolve();
      })
      .on("error", err => {
        console.error("error: ", err.message);
        fs.unlink(copyFilePath, () => reject(err));
      })
      .run();
  });
}

function millisecondsToMinutesAndSeconds(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds };
}

const getTagName = value => TagTypes[value.toString()] || "Unknown";

const getTagValue = name => TagTypes[name] || -1;

const tagger = async (file, dir) => {
  /*   const filestat = await stat(file);
  console.log(filestat); */
  try {
    /* processFile(file); */
    /* ffmpeg.ffprobe(file, (err, metadata) => {
      if (err) {
        console.error("Error getting file info:", err);
        return;
      }
      console.log("File Metadata:", metadata);
      console.log("-----------------------");
    }); */
    const myFile = File.createFromPath(file);
    console.log(myFile.tag.title, "-----", myFile.properties.codecs);
    /* console.log(myFile.properties); */
    //console.log(myFile.corruptionReasons());
    /*     console.log(path.parse(file).root); */
    /*     const data = {
      file,

      codecs: myFile.properties.description,
      artist: myFile.tag.performers,
      album: myFile.tag.album,
      genres: myFile.tag.genres,
    };
    writeFile(data);
    myFile.dispose(); */
  } catch (error) {
    console.error(error.message);
    processFile(file);
  }
};

const readDir = async () => {
  const dir = "H:/Music/Azumi Nishizawa - Debussy Hommage";
  // const files = await fg(`J:/test/**/*.{mp3,flac,ape,m4a,ogg}`);
  const files = await fg(
    `H:/Music/Azumi Nishizawa - Debussy Hommage/**/*.{mp3,flac,ape,m4a,ogg}`
  );

  const revisit = [];
  for await (const file of files) {
    const directory = file.slice(0, file.lastIndexOf("/"));
    const filename = path.basename(file);
    const originalFilePath = path.join(directory, filename);
    revisit.push({ file: originalFilePath, dir });
  }

  revisit.forEach(r => tagger(r.file, r.dir));
  return;
};

readDir();

/* myFile.tag.pictures = [Picture.fromPath("./pic.jpg")]; */
/* const myPicture = Picture.fromPath("path/to/my/picture.jpg");
    myFile.tag.pictures = [myPicture]; */
/* console.log(myFile.tag.pictures); */
/* console.log(Picture.fromPath(file).description); */

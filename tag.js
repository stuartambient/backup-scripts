import fs, { copy } from "fs-extra";
import path from "path";
import fg from "fast-glob";

import {
  File,
  Tag,
  Picture,
  TagTypes,
  Genres,
  Id3v2Tag,
  Id3v2Frame,
  Id3v2FrameHeader,
  Id3v2FrameIdentifier,
  Id3v2FrameIdentifiers,
  Id3v2Settings,
  Id3v2TextInformationFrame,
  Id3v2FrameClassType,
  MpegAudioFile,
} from "node-taglib-sharp";

import { default as MpegAudioFileSettings } from "node-taglib-sharp/dist/mpeg/mpegAudioFileSettings.js";

const tagger = (file, dir) => {
  const myFile = File.createFromPath(file);

  const tags = [
    year,
    track,
    disk,
    title,
    artist,
    artists,
    albumartist,
    album,
    data,
    genre,
    picture,
  ];

  /*  for (const t of tags) {
    t
  } */

  myFile.save();
  myFile.dispose();
};

const readDir = async () => {
  const dir = "J:/test";
  const files = await fg(`J:/test/**/*.{mp3,flac,ape,m4a,ogg}`);
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

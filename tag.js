import fs, { copy } from "fs-extra";
import path from "path";
import fg from "fast-glob";

import {
  File,
  Tag,
  Picture,
  TagTypes,
  Genres,
  Id3v1Tag,
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

function millisecondsToMinutesAndSeconds(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return { minutes, seconds };
}

const tagger = (file, dir) => {
  try {
    const myFile = File.createFromPath(file);
    console.log("file: ", file);
    /* console.log("tagtypes: ", myFile.tagTypes); */

    console.log("artist: ", myFile.tag.performers);
    myFile.tag.performers = ["Test 123"];
    /* console.log("albums-artists:", myFile.tag.fields); */
    /*     console.log("bitrate: ", myFile.properties.audioBitrate);
    console.log("sample-rate: ", myFile.properties.audioSampleRate);
    console.log(
      "duration: ",
      millisecondsToMinutesAndSeconds(myFile.properties.durationMilliseconds)
    ); */
    /* 
    const mediaType = myFile.properties.mediaTypes;
    if (mediaType === 1) {
      console.log("media-type: ", "lossy");
    } else if (mediaType === 17) {
      console.log("media-type: ", "lossless");
    }
    console.log("description: ", myFile.properties.description); */
    myFile.save();
    /* myFile.dispose(); */
  } catch (error) {
    return;
  }
};

const readDir = async () => {
  const dir = "F:/music";
  // const files = await fg(`J:/test/**/*.{mp3,flac,ape,m4a,ogg}`);
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

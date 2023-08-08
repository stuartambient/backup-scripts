import { spawn } from "node:child_process";
import fs, { copy } from "fs-extra";
import path from "path";
import fg from "fast-glob";
import { File, Tag, Picture } from "node-taglib-sharp";

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

const writeMeta = async (file, dir) => {
  const extname = path.extname(file);
  console.log(extname);
  /*  ffmpeg -i aiff.aiff -map 0 -y -codec copy -write_id3v2 1 -metadata "artist-sort=emon feat sort" aiffout.aiff */
  const child = await spawn("ffmpeg", [
    "-hide_banner",
    "-i",
    `${file}`,
    "-map",
    "0",
    "-y",
    "-codec",
    "copy",
    "-metadata",
    "album=Phantabla III",
    /* `${og}`, */
    `${file}.${extname}`,
  ]);

  child.stdout.on("data", data => {
    console.log(`child stdout:\n${data}`);
  });

  child.stderr.on("data", data => {
    const errorMessage = data.toString().trim();
    if (errorMessage.startsWith("Error")) {
      console.error(`child stderr:\n${errorMessage}`);
    }
  });
  child.on("close", async code => {
    if (code === 0) {
      /* await fs.promises.rename("tmp.flac", file); */
      console.log("ffmpeg operation completed successfully");
      await fs.renameSync(`${file}.${extname}`, file);
    } else {
      console.error(`ffmpeg operation failed with exit code ${code}`);
    }
  });
};

/* const meta = async (copy, og) => {
  let dataBuffer = "";
  const child = await spawn("ffprobe", [
    "-hide_banner",
    "-print_format",
    "json",
    "-show_format",
    `${copy}`,
  ]);

  process.stdin.pipe(child.stdin);

  child.stdout.on("data", data => {
    dataBuffer += data.toString();
  });

  child.stdout.on("end", () => {
    try {
      const parsedData = JSON.parse(dataBuffer);
      writeMeta(parsedData.format.filename, og);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  });
}; */

const tagger = (file, dir) => {
  const myFile = File.createFromPath(file);
  const title = path.basename(file);
  try {
    /*   if (!myFile.tag.title) {
      myFile.tag.title = path.basename(file);
    } */

    /*   if (myFile.tag.title) {
      console.log(file, myFile.tag.title);
    } */

    /*     const flac = myFile.getTag(TagTypes.FLAC, true);
    console.log(flac); */

    /* console.log(myFile.properties); */
    /* console.log(myFile.tag.isEmpty); */
    /* console.log(myFile.tag);
    console.log("----------------"); */

    if (!myFile.tag.title) {
      myFile.tag.title = title;
    }

    /*  console.log(myFile.isPossiblyCorrupt, myFile.position, myFile.isWritable); */
    myFile.tag.picture = Picture.fromPath("./pic.jpg");
    myFile.save();
    myFile.dispose();
  } catch (err) {
    myFile.removeTags;
    console.error(err.message, file);
    myFile.save();
    myFile.dispose();
  }
};

const readDir = async () => {
  const dir = "J:/test";
  const files = await fg(`J:/test/**/*.{mp3,flac,ape,m4a,ogg}`);
  const revisit = [];
  for await (const file of files) {
    const directory = file.slice(0, file.lastIndexOf("/"));
    const filename = path.basename(file);

    /*     const fileExtension = path.extname(file);
    const baseFileName = path.basename(filename);
    const copyFileName =
      baseFileName.replace(fileExtension, "") + " - copy" + fileExtension; */

    const originalFilePath = path.join(directory, filename);
    /*     const copyFilePath = path.join(directory, copyFileName); */

    /* console.log(originalFilePath, "----", copyFilePath); */
    revisit.push({ file: originalFilePath, dir });

    /*     await copyFile(originalFilePath, copyFilePath).then(() =>
      revisit.push({ og: originalFilePath, copy: copyFilePath })
    ); */

    /*     const child = spawn("ffprobe", [
      "-hide_banner",
      "-show_format",
      "-print_format",
      "json",
      `${copyFilePath}`,
    ]);

    process.stdin.pipe(child.stdin);

    child.stdout.on("data", data => {
      console.log(`child stdout:\n${data}`);d
    }); */
  }
  /* meta(revisit); */
  revisit.forEach(r => tagger(r.file, r.dir));
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

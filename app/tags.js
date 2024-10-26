import { File } from "node-taglib-sharp";

const checkFile = () => {
  const myfile = File.createFromPath(
    "H:/Music/Medeski, Scofield, Martin and Wood - Juice (2014) [FLAC]/01 - Sham Time.flac"
  );
  console.log(myfile.properties);
  console.log(myfile.tag.pictures);
};

checkFile();

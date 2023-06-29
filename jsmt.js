import jsmediatags from "jsmediatags";

const readTag = async () => {
  jsmediatags.read(
    "D:/music/3 Electro Knights - Sketches For Another Future/01 - Chronoglide.flac",
    {
      onSuccess: function (tag) {
        console.log(tag, tag.tags.picture.data);
      },
      onError: function (error) {
        console.log(error.type, "----", error.info);
      },
    }
  );
};

readTag();

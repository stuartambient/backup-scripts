import { exiftool } from "exiftool-vendored";
import Database from "better-sqlite3";
import { parseFile } from "music-metadata";
import { writeFileSync } from "fs";
import { File } from "node-taglib-sharp";

const dbPath = `C:/users/sambi/documents/nodeprojs/music-molecule/src/db/music.db`;
const db = new Database(dbPath);

const filesWithErrors = () => {
  const stmt = db.prepare(
    `SELECT audiotrack, error FROM "audio-tracks" WHERE error IS NOT NULL`
  );
  return stmt.all();
};

const filesWithZeroBitrate = () => {
  const stmt = db.prepare(
    `SELECT audiotrack FROM "audio-tracks" WHERE audioBitrate = 0`
  );
  return stmt.all();
};
async function exportMetadataToJson() {
  const rows = filesWithErrors();
  const metadataResults = {};

  for (const { audiotrack } of rows) {
    try {
      // `read` returns an object with all available metadata tags.
      // ExifTool provides extensive metadata for supported audio formats,
      // which should include ID3 tags, as well as any discovered errors.
      const tags = await exiftool.read(audiotrack);

      // Store the tags keyed by the audiotrack name.
      // You can also include the error from the database query if needed.
      metadataResults[audiotrack] = {
        ...tags,
        // Optionally include the DB error field if you want:
        // dbError: error
      };
    } catch (err) {
      // If exiftool fails, record the error instead of tags
      metadataResults[audiotrack] = { error: err.message };
    }
  }

  // Write all metadata to a JSON file, formatting for readability
  writeFileSync("metadata.json", JSON.stringify(metadataResults, null, 2));
}

/* exportMetadataToJson()
  .then(() => console.log("Metadata exported to metadata.json"))
  .catch(err => console.error("Error exporting metadata:", err))
  .finally(() => {
    // Make sure to properly end the exiftool process when done
    exiftool.end();
  }); */

async function exportAbridgedMetadataToJson() {
  const rows = filesWithErrors();
  const abridgedResults = {};

  for (const { audiotrack } of rows) {
    try {
      const tags = await exiftool.read(audiotrack);
      // Extract only the fields we care about. If these fields don't exist,
      // they'll just be `undefined`. You can provide fallback values if you like.
      const { SourceFile, errors, warnings, FrameCount } = tags;

      abridgedResults[audiotrack] = {
        SourceFile,
        errors: errors ?? [],
        warnings: warnings ?? [],
        FrameCount: FrameCount ?? null,
      };
    } catch (err) {
      // If exiftool fails for some reason, we'll store the error under 'errors'.
      abridgedResults[audiotrack] = {
        SourceFile: audiotrack,
        errors: [err.message],
        warnings: [],
        FrameCount: null,
      };
    }
  }

  // Write the abridged metadata to a JSON file
  writeFileSync(
    "abridgedMetadata.json",
    JSON.stringify(abridgedResults, null, 2)
  );
}

// Run the abridged export function
/* exportAbridgedMetadataToJson()
  .then(() =>
    console.log("Abridged metadata exported to abridgedMetadata.json")
  )
  .catch(err => console.error("Error exporting abridged metadata:", err))
  .finally(() => {
    exiftool.end();
  });
 */
async function exportMusicMetadataToJson() {
  const rows = filesWithErrors();
  const metadataResults = {};

  for (const { audiotrack } of rows) {
    try {
      const tags = await parseFile(audiotrack);
      const { quality } = tags;

      // If warnings exist, extract just their messages
      let warningMessages = [];
      if (quality && Array.isArray(quality.warnings)) {
        warningMessages = quality.warnings.map(
          warning => warning.message || warning
        );
      }

      metadataResults[audiotrack] = {
        quality: {
          warnings: warningMessages,
        },
      };
    } catch (err) {
      console.error("error: ", err);
      metadataResults[audiotrack] = { error: err.message };
    }
  }

  writeFileSync("music-quality.json", JSON.stringify(metadataResults, null, 2));
}

/* exportMusicMetadataToJson()
  .then(() => console.log("Metadata exported to music-metadata.json"))
  .catch(err => console.error("Error exporting metadata:", err)); */

async function exportNtsToJson() {
  const errors = [];
  const rows = filesWithZeroBitrate();
  //const rows = filesWithErrors();
  const metadataResults = {};

  for (const { audiotrack } of rows) {
    try {
      const myFile = File.createFromPath(audiotrack);
      console.log(audiotrack);
      console.log(myFile.properties.audioBitrate);
      console.loog(myFile.tag.corruptReason);
    } catch (err) {
      errors.push(err.message);
    }
  }
}

exportNtsToJson();

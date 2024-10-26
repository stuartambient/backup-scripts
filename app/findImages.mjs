import fg from "fast-glob";
import fs from "fs-extra";
import path from "node:path";
import Database from "better-sqlite3";

import { fileURLToPath } from "url";
import { dirname } from "path";

// Convert __filename and __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(path.join(__dirname, "graphics_files.db"));

// Function to create the table if it doesn't exist
function createTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS graphics_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      directory TEXT NOT NULL,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      last_modified TEXT NOT NULL
    )
  `;
  db.exec(createTableSQL);
}

function createDirectoryTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS scanned_directories (
      directory TEXT PRIMARY KEY
    )
  `;
  db.exec(createTableSQL);
}

function addScannedDirectory(directory) {
  const insertSQL = `
    INSERT OR IGNORE INTO scanned_directories (directory)
    VALUES (@directory)
  `;
  const stmt = db.prepare(insertSQL);
  stmt.run({ directory: normalizePath(directory) });
}

function getAllScannedDirectories() {
  const selectSQL = `
    SELECT directory FROM scanned_directories
  `;
  const stmt = db.prepare(selectSQL);
  return stmt.all().map(row => row.directory);
}

// Function to insert or update records in the database
function insertOrUpdateFile(fileInfo) {
  const insertSQL = `
    INSERT INTO graphics_files (directory, name, path, last_modified)
    VALUES (@directory, @name, @path, @last_modified)
    ON CONFLICT(path) DO UPDATE SET
      directory = excluded.directory,
      name = excluded.name,
      last_modified = excluded.last_modified
  `;

  const stmt = db.prepare(insertSQL);
  stmt.run({
    ...fileInfo,
    directory: normalizePath(fileInfo.directory),
    path: normalizePath(fileInfo.path),
  });
}

// Function to delete records that no longer exist in the file system
function deleteMissingFiles(existingFiles, scannedDirectories) {
  const existingPaths = new Set(
    existingFiles.map(file => normalizePath(file.path))
  );

  const allFilesInDB = db
    .prepare(
      `
    SELECT path FROM graphics_files
  `
    )
    .all();

  allFilesInDB.forEach(file => {
    const normalizedPath = normalizePath(file.path);
    if (!existingPaths.has(normalizedPath)) {
      let fileExists = false;
      for (const dir of scannedDirectories) {
        if (fs.existsSync(path.join(dir, path.basename(normalizedPath)))) {
          fileExists = true;
          break;
        }
      }

      if (!fileExists) {
        const deleteSQL = `
          DELETE FROM graphics_files
          WHERE path = ?
        `;
        const stmt = db.prepare(deleteSQL);
        stmt.run(normalizedPath);
      }
    }
  });
}

function normalizePath(p) {
  return p.replace(/\\/g, "/");
}

function escapeSpecialChars(path) {
  return path.replace(/[\[\]\(\)]/g, "\\$&");
}
// Function to find graphic files and update the database
async function findAndStoreGraphicFiles(baseDir) {
  createTable();
  createDirectoryTable();

  addScannedDirectory(baseDir);
  const scannedDirectories = getAllScannedDirectories();

  const escapedPattern = escapeSpecialChars(baseDir);
  const pattern = `${escapedPattern}/**/*.{jpg,jpeg,png,webp}`;
  const options = {
    dot: true,
    onlyFiles: true,
    stats: true,
  };

  try {
    const files = await fg(pattern, options);

    const result = files.map(file => {
      return {
        directory: normalizePath(path.dirname(file.path)),
        name: path.basename(file.path),
        path: normalizePath(path.resolve(file.path)),
        last_modified: file.stats.mtime.toISOString(),
      };
    });

    // Insert or update the records in the database
    result.forEach(fileInfo => insertOrUpdateFile(fileInfo));

    // Delete records for files that no longer exist
    deleteMissingFiles(result, scannedDirectories);

    console.log("Database updated with graphic files.");
  } catch (err) {
    console.error("Error finding graphic files:", err);
    throw err;
  }
}

function getCountByGroupName() {
  const query = `
    SELECT name, COUNT(*) AS count
    FROM graphics_files
    GROUP BY name
    ORDER BY count DESC
  `;

  const stmt = db.prepare(query);
  const result = stmt.all();

  return result;
}

// Function to run from the command line
async function runGraphicFilesUpdate() {
  const baseDir = process.argv[2];
  if (!baseDir) {
    console.error("Please provide a base directory");
    process.exit(1);
  }
  await findAndStoreGraphicFiles(baseDir)
    .then(() => {
      console.log("Process completed successfully.");
      const groupedCounts = getCountByGroupName();
      console.log("Grouped counts by name:", groupedCounts);
    })
    .catch(err => {
      console.error("Error:", err);
    });
}

/* console.log("import.meta.url:", import.meta.url);
console.log("__filename:", __filename); */

// Check if the script is run directly from the command line
const normalizedImportMetaUrl = fileURLToPath(import.meta.url);
if (normalizedImportMetaUrl === __filename) {
  console.log("Script is being executed directly.");
  runGraphicFilesUpdate();
} else {
  console.log("Script is not being executed directly.");
}

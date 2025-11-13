import fs from "fs-extra";
import path from "node:path";
import fg from "fast-glob";
import chalk from "chalk";
import runSync from "./runSync.js";

const [, , arg] = process.argv;
let backup = "";
let origin = "";

async function deleteEmptyDirs(directoryPath) {
  const files = await fs.promises.readdir(directoryPath);

  if (files.length === 0) {
    await fs.promises.rmdir(directoryPath);
    return;
  }

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = await fs.promises.stat(filePath);
    if (stats.isDirectory()) {
      await deleteEmptyDirs(filePath);
    }
  }
}

async function readDirRecursive(dirPath) {
  const patterns = ["**/*.*"];
  const options = {
    cwd: dirPath,
    onlyFiles: true,
    absolute: true,
    dot: true,
  };
  const filePaths = await fg(patterns, options);
  await deleteEmptyDirs(dirPath);
  return filePaths;
}

/* async function copyFile(sourcePath, destPath) {
  const sourceStream = fs.createReadStream(sourcePath);
  const destStream = fs.createWriteStream(destPath);

  return new Promise((resolve, reject) => {
    sourceStream.on("error", reject);
    destStream.on("error", reject);
    destStream.on("finish", resolve);

    sourceStream.pipe(destStream);
  });
} */

/* async function backupFile(source, backupDir) {
  const log = console.log;
  const filenameBU = path.basename(backupDir);
  const dirnameBU = path.dirname(backupDir);
  const filenameSO = path.basename(source);
  const dirnameSO = path.dirname(source);
  const backupPath = path.join(dirnameBU, filenameBU);
  const sourcePath = path.join(dirnameSO, filenameSO);
  try {
    await copyFile(sourcePath, backupPath);
    return true;
  } catch (error) {
    log(chalk.red(` ${sourcePath} to ${backupPath} - ${error.message}`));
    return error;
  }
} */

async function copyWithBackoff(src, dest, attempts = 5) {
  let delay = 200; // start with 200ms
  for (let i = 1; i <= attempts; i++) {
    try {
      await fs.copy(src, dest, { overwrite: true, errorOnExist: false });
      return true;
    } catch (err) {
      if (["EPERM", "EBUSY", "EACCES"].includes(err.code)) {
        console.warn(
          chalk.yellow(
            `⚠️  ${err.code} on "${dest}" — retry ${i}/${attempts} after ${delay} ms`
          )
        );
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * 1.5, 2000);
        continue;
      }
      console.error(chalk.red(`❌ ${src} → ${dest} — ${err.message}`));
      return false;
    }
  }

  console.error(
    chalk.red(`❌ Still locked after ${attempts} attempts: ${dest}`)
  );
  return false;
}

async function backupFile(source, backupPath) {
  try {
    const ok = await copyWithBackoff(source, backupPath, 5);
    if (ok) return true;
    console.error(chalk.red(`Backup failed: ${source}`));
    return false;
  } catch (error) {
    console.error(chalk.red(`${source} → ${backupPath} - ${error.message}`));
    return false;
  }
}

async function makeDirectory(path) {
  try {
    await fs.promises.mkdir(path, { recursive: true });

    return true;
  } catch (error) {
    return false;
  }
}

async function checkDirectoryExists(path) {
  try {
    await fs.access(path);

    return true;
  } catch (error) {
    return false;
  }
}

async function remBackup(arr) {
  const removal = { removed: [], errors: [] };
  for await (const a of arr) {
    try {
      const rm = await fs.promises.unlink(path.join(backup, a));
      removal.removed.push(path.join(backup, a));
    } catch (error) {
      /* console.error(`Error processing directory ${a}: ${error}`); */
      removal.errors.push(`${path.join(backup, a)} -- ${error}`);
    } finally {
      const tmp = path.join(backup, a);
      await deleteEmptyDirs(tmp.slice(0, tmp.lastIndexOf("\\")));
    }
    /* console.log(path.join(backup, a)); */
  }
  return removal;
}

/* async function procBackup(arr) {
  const operation = { resolved: [], jobsLength: arr.length, failed: [] };

  for await (const a of arr) {
    let tmp = await checkDirectoryExists(path.dirname(`${backup}/${a}`));
    if (!tmp) await makeDirectory(path.dirname(`${backup}/${a}`));

    try {
      const buFile = await backupFile(`${origin}/${a}`, `${backup}/${a}`);
      if (buFile) {
        operation.resolved.push(`${backup}/${a}`);
      } else {
        operation.failed.push(dest);
      }
      await new Promise(r => setTimeout(r, 100)); // let NTFS finish flush
    } catch (error) {
      operation.failed.push(`${error.msg} - ${origin}/${a}`);
    }
  }
  return operation;
} */

async function procBackup(arr) {
  const operation = { resolved: [], jobsLength: arr.length, failed: [] };

  for await (const a of arr) {
    try {
      const src = path.join(origin, a);
      const dest = path.join(backup, a);
      const dir = path.dirname(dest);

      const exists = await checkDirectoryExists(dir);
      if (!exists) await makeDirectory(dir);

      const ok = await backupFile(src, dest);

      if (ok) {
        // ✅ Prevent accidental duplicates
        if (!operation.resolved.includes(dest)) {
          operation.resolved.push(dest);
        }
      } else {
        operation.failed.push(dest);
      }

      // ✅ Small delay between files for NTFS flush stability
      await new Promise(r => setTimeout(r, 100));
    } catch (error) {
      operation.failed.push(`${origin}/${a} — ${error.message}`);
    }
  }

  return operation;
}

/* const filterFiles = async (type, d1, d2) => {
  const arr = [];
  for await (const f of d2) {
    if (type === "bu" && d1.includes(f) && !f.endsWith("desktop.ini")) {
      const fSize1 = await fs.promises.stat(`${backup}/${f}`);
      const fSize2 = await fs.promises.stat(`${origin}/${f}`);

      if (fSize1.size > fSize2.size) {
        arr.push(f);
      }
      if (fSize2.mtimeMs > fSize1.mtimeMs) {
        arr.push(f);
      }
    }

    if (!d1.includes(f)) {
      arr.push(f);
    }
  }
  return arr;
}; */

const filterFiles = async (type, d1, d2) => {
  const arr = new Set();

  for await (const f of d2) {
    if (type === "bu" && d1.includes(f) && !f.endsWith("desktop.ini")) {
      const fSize1 = await fs.promises.stat(`${backup}/${f}`);
      const fSize2 = await fs.promises.stat(`${origin}/${f}`);

      if (fSize1.size > fSize2.size || fSize2.mtimeMs > fSize1.mtimeMs) {
        arr.add(f);
      }
    }

    if (!d1.includes(f)) {
      arr.add(f);
    }
  }

  return [...arr]; // convert Set → Array
};

const removeRoot = files => {
  return files.map(f =>
    f.startsWith(`${backup}`)
      ? f.replace(`${backup}/`, "")
      : f.replace(`${origin}/`, "")
  );
};

const getFilesInDir = async dir => {
  return await readDirRecursive(dir);
};

/* const displayResults = (type, obj) => {
  if (type === "backed-up") {
    console.log("backed up: ");
    obj.resolved.forEach(res => {
      console.log(res);
    });
    //
  } else if (type === "removed") {
    console.log("removed: ");
    obj.removed.forEach(rem => {
      console.log(rem);
    });
  }
}; */

/* const displayResults = (type, obj) => {
  if (type === "backed-up") {
    const unique = [...new Set(obj.resolved)];
    console.log(
      `\n📦 Backed-up files (${unique.length}):\n` + unique.join("\n")
    );
  } else if (type === "removed") {
    const unique = [...new Set(obj.removed)];
    console.log(
      `\n🗑️  Removed files (${unique.length}):\n` + unique.join("\n")
    );
  }
}; */

const displayResults = (type, obj) => {
  if (type === "backed-up") {
    const unique = [...new Set(obj.resolved)];
    console.log(
      `\n📦 Backed-up files (${unique.length}):\n` + unique.join("\n")
    );
  } else if (type === "removed") {
    const unique = [...new Set(obj.removed)];
    console.log(
      `\n🗑️  Removed files (${unique.length}):\n` + unique.join("\n")
    );
  }
};

const getFiles = async (backup, origin) => {
  const log = console.log;
  const backupFiles = await getFilesInDir(backup);
  const originFiles = await getFilesInDir(origin);
  const backupNoRoot = removeRoot(backupFiles);
  const originNoRoot = removeRoot(originFiles);

  const notOnBackupDrive = await filterFiles("bu", backupNoRoot, originNoRoot);
  const removeFromBackup = await filterFiles("rm", originNoRoot, backupNoRoot);
  log(
    chalk.yellow.bold("On backup drive: "),
    chalk.yellow(backupNoRoot.length),
    "    ",
    chalk.green.bold("On origin drive: "),
    chalk.green(originNoRoot.length),
    "\n"
  );

  log(
    chalk.cyan.bold("Pending backup updates: "),
    chalk.cyan(notOnBackupDrive.length),
    "    ",
    chalk.magenta.bold("Pending removals: "),
    chalk.magenta(removeFromBackup.length)
  );
  if (!notOnBackupDrive.length && !removeFromBackup.length) {
    return log(chalk.yellow("No pending jobs"));
  }
  await procBackup(notOnBackupDrive).then(results =>
    displayResults("backed-up", results)
  );
  await remBackup(removeFromBackup).then(results =>
    displayResults("removed", results)
  );
};

const startSync = () => {
  try {
    const drives = runSync(arg);
    if (drives === `${arg} is not a valid option`) {
      return console.error(chalk.red(drives));
    }
    backup = drives.backupDrive;
    origin = drives.originDrive;
    getFiles(backup, origin);
  } catch (error) {
    console.error("Error: ", error.message);
  }
};

startSync();

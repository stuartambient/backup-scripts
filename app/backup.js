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

async function backupFile(source, backupDir) {
  const filenameBU = path.basename(backupDir);
  const dirnameBU = path.dirname(backupDir);
  const filenameSO = path.basename(source);
  const dirnameSO = path.dirname(source);
  /* const filenameSO = path.basename(); */
  const backupPath = path.join(dirnameBU, filenameBU);
  const sourcePath = path.join(dirnameSO, filenameSO);
  /* console.log(sourcePath, "------", backupPath); */
  try {
    await copyFile(sourcePath, backupPath);
    return true;
  } catch (error) {
    console.error(`Error backed up file: ${sourcePath} to ${backupPath}`);
    console.error("Error messsage: ", error.message);
    return error;
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

async function procBackup(arr) {
  const operation = { resolved: [], jobsLength: arr.length, failed: [] };

  for await (const a of arr) {
    let tmp = await checkDirectoryExists(path.dirname(`${backup}/${a}`));
    if (!tmp) await makeDirectory(path.dirname(`${backup}/${a}`));

    try {
      const buFile = await backupFile(`${origin}/${a}`, `${backup}/${a}`);
      if (buFile) {
        operation.resolved.push(`${backup}/${a}`);
      }
    } catch (error) {
      operation.failed.push(`${error.msg} - ${origin}/${a}`);
    }
  }
  return operation;
}

const filterFiles = async (type, d1, d2) => {
  const arr = [];
  for await (const f of d2) {
    if (type === "bu" && d1.includes(f)) {
      const fSize1 = await fs.promises.stat(`${backup}/${f}`);
      const fSize2 = await fs.promises.stat(`${origin}/${f}`);
      if (fSize1.size < fSize2.size) {
        arr.push(f);
      }
    }
    if (!d1.includes(f)) {
      arr.push(f);
    }
  }
  return arr;
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

const displayResults = (type, obj) => {
  console.log(type, obj);
};

const getFiles = async (dir1, dir2) => {
  const log = console.log;
  const d1 = await getFilesInDir(dir1);
  const d2 = await getFilesInDir(dir2);
  const da = removeRoot(d1);
  const db = removeRoot(d2);

  const notOnBackupDrive = await filterFiles("bu", da, db);
  const removeFromBackup = await filterFiles("rm", db, da);
  log(
    chalk.yellow.bold("On backup drive: "),
    chalk.yellow(da.length),
    "         ",
    chalk.green.bold("On origin drive: "),
    chalk.green(db.length)
  );
  if (!notOnBackupDrive.length && !removeFromBackup.length) {
    console.log("");
    return log(chalk.rgb(15, 100, 204).inverse("No pending jobs"));
  }
  await procBackup(notOnBackupDrive).then(results =>
    displayResults("backed-up", results)
  );
  await remBackup(removeFromBackup).then(results =>
    displayResults("removed", results)
  );

  /*
  console.log(
    chalk.red.bold("to be backed up: "),
    chalk.red(notOnBackupDrive.length)
  );
  console.log(
    chalk.blue.bold("to be removed from backup: "),
    chalk.blue(removeFromBackup.length)
  );

  console.log(`Backup results for ${jobsLength} files :`);
  if (resolved.length) {
    console.log("Successes: ");
    resolved.forEach(r => console.log(r));
  }
  if (failed.length) {
    console.log("Failure: ");
    console.log(failed.forEach(f => console.log(f)));
  }

  console.log(rmbkup); */
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

/* node backup G && node backup F && node backup D && node backup H && node backup I */

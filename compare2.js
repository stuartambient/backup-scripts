import fs from "fs-extra";
import path from "node:path";
import fg from "fast-glob";
import chalk from "chalk";
import runSync from "./runSync.js";

/* const backup = process.argv[2];
const origin = process.argv[3]; */

const [, , arg] = process.argv;
let backup = "";
let origin = "";

async function readDirRecursive(dirPath) {
  const patterns = ["**/*.*"];
  const options = {
    cwd: dirPath,
    onlyFiles: true,
    absolute: true,
    dot: true,
  };
  const filePaths = await fg(patterns, options);
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
    }
    /* console.log(path.join(backup, a)); */
  }
  return removal;
}

async function procBackup(arr) {
  const operation = { resolved: 0, jobsLength: arr.length, failed: 0 };

  for await (const a of arr) {
    let tmp = await checkDirectoryExists(path.dirname(`${backup}/${a}`));
    if (!tmp) await makeDirectory(path.dirname(`${backup}/${a}`));

    try {
      const buFile = await backupFile(`${origin}/${a}`, `${backup}/${a}`);
      if (buFile) {
        operation.resolved += 1;
      }
    } catch (error) {
      console.error(`Error processing directory ${a}: ${error}`);
      operation.failed += 1;
    }
  }
  return operation;
}

const getFilteredFiles = (d1, d2) => {
  return d2.filter(o => !d1.includes(o));
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

const getFiles = async (dir1, dir2) => {
  const d1 = await getFilesInDir(dir1);
  const d2 = await getFilesInDir(dir2);
  const da = removeRoot(d1);
  const db = removeRoot(d2);

  const notOnBackupDrive = getFilteredFiles(da, db);
  const removeFromBackup = getFilteredFiles(db, da);
  console.log(chalk.yellow.bold("backup length: "), chalk.yellow(da.length));
  console.log(chalk.green.bold("origin length: "), chalk.green(db.length));
  console.log(
    chalk.red.bold("to be backed up: "),
    chalk.red(notOnBackupDrive.length)
  );
  console.log(
    chalk.blue.bold("to be removed from backup: "),
    chalk.blue(removeFromBackup.length)
  );
  const backupFiles = await procBackup(notOnBackupDrive);
  console.log("result: ", backupFiles);
  const rmbkup = await remBackup(removeFromBackup);
  console.log(rmbkup);
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

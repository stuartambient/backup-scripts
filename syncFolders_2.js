/* import fs from "node:fs"; */
import fs from "fs-extra";
import chalk from "chalk";
import runSync from "./runSync.js";

const [, , arg] = process.argv;

let backupDrive = "";
let originDrive = "";

const writeFile = async (data, filename) => {
  fs.writeFileSync(filename, data, { flag: "a", encoding: "utf8" });
};

const createDir = async dir => {
  try {
    await fs.ensureDir(`${backupDrive}/${dir}`);
    await fs.copy(`${originDrive}/${dir}`, `${backupDrive}/${dir}`);
    console.log("success", dir);
  } catch (err) {
    writeFile(`${err}\n`, "errors.txt");
  }
};

const readPath = async drive => fs.promises.readdir(drive);

const findDiff = async (driveA, driveB) =>
  driveA.filter(a => !driveB.includes(a));

const bkup = async arr => {
  const operation = { resolved: 0, jobsLength: arr.length, failed: 0 };
  for await (const a of arr) {
    try {
      const createdir = await createDir(a);
      if (createdir) operation.resolved += 1;
    } catch (error) {
      console.error(`${a} --- ${error.message}`);
      operation.failed += 1;
    }
  }
  return operation;
};

const remBkup = async arr => {
  const operation = { resolved: 0, jobsLength: arr.length, failed: 0 };
  for await (const a of arr) {
    try {
      const removed = await fs.promises.rm(`${backupDrive}/${a}`, {
        recursive: true,
        force: true,
      });
      if (removed) operation.resolved += 1;
    } catch (error) {
      console.error(`${backupDrive}/${a} --- ${error.message}`);
      operation.failed += 1;
    }
  }
  return operation;
};

const albumFolders = async () => {
  const drive = await readPath(originDrive);
  const buDrive = await readPath(backupDrive);

  const diff = await findDiff(buDrive, drive);
  const backup = await findDiff(drive, buDrive);
  console.log("folders to be removed from backup: ", diff.length);
  console.log("folders to be backed up: ", backup.length);
  console.log(chalk.yellowBright("Starting backup drive folder removal..."));
  const rem = await remBkup(diff);
  console.log(chalk.blueBright.bold(rem));
  console.log(chalk.yellowBright("Starting folder backup..."));
  const bu = await bkup(backup);
  console.log(chalk.blueBright.bold(bu));

  /*  for await (const bk of backup) {
    await createDir(bk);
  } */
};

const startSync = () => {
  try {
    const drives = runSync(arg);
    if (drives === `${arg} is not a valid option`) {
      return console.error(chalk.red(drives));
    }
    backupDrive = drives.backupDrive;
    originDrive = drives.originDrive;
    albumFolders();
  } catch (error) {
    console.error("Error: ", error.message);
  }
};

startSync();

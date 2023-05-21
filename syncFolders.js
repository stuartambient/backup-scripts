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

const albumFolders = async () => {
  const drive = await fs.promises.readdir(originDrive);
  const buDrive = await fs.promises.readdir(backupDrive);

  const diff = buDrive.filter(b => !drive.includes(b));
  console.log("folders to be removed from backup: ", diff.length);
  for await (const d of diff) {
    try {
      await fs.promises.rm(`${backupDrive}/${d}`, {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.error(`${backupDrive}/${d} --- ${error.message}`);
    }
  }
  const backup = drive.filter(d => !buDrive.includes(d));
  console.log("folders to be backed up: ", backup.length);
  for await (const bk of backup) {
    await createDir(bk);
  }
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

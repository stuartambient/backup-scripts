const BACKUP_DIR = "backup";
const ORIGIN_DIR = "origin";

async function optimizedBackup(source, backupDir) {
  // Use constants for file paths
  const filenameBU = path.basename(backupDir);
  const dirnameBU = path.dirname(backupDir);
  const filenameSO = path.basename(source);
  const dirnameSO = path.dirname(source);
  const backupPath = path.join(BACKUP_DIR, filenameBU);
  const sourcePath = path.join(ORIGIN_DIR, filenameSO);

  // Cache fs.promises.stat() results
  let sourceStat;
  let backupStat;

  try {
    sourceStat = await fs.promises.stat(sourcePath);
  } catch (err) {
    // Early return if source file does not exist
    return;
  }

  try {
    backupStat = await fs.promises.stat(backupPath);
  } catch (err) {
    // Proceed if backup file does not exist
  }

  // Compare file stats to check if backup is needed
  // and early return if not needed
  if (backupStat && backupStat.size === sourceStat.size) return;

  // Create backup
  await copyFile(sourcePath, backupPath);
}

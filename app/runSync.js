const syncs = {
  G: ["G:/G_Music_Backup", "D:/G_Music"],
  F: ["G:/F_Music_Backup", "F:/Music"],
  /* J: ["G:/S_Music_Backup", "J:/S_Music"], */
  D: ["I:/D_Music_Backup", "D:/music"],
  /* I: ["G:/I_Music_Backup", "I:/Music"], */
  H: ["G:/H_Music_Backup", "H:/Music"],
  I: ["E:/I_Music_Backup", "I:/music"],
  VIDEOS: ["E:/Video_Backup", "H:/Videos"],
};

const runSync = dir => {
  if (dir === "-h" || dir === "--help") {
    return "HELP DESK";
  } else if (!syncs.hasOwnProperty(dir)) {
    return `${dir} is not a valid option`;
  } else {
    console.log(dir);
  }

  const backupDrive = syncs[dir][0];
  const originDrive = syncs[dir][1];
  return { backupDrive, originDrive };
};

export default runSync;

/* getFiles(backup, origin);

getFiles has the following - 

both go to getFilesInDir
those go to removeRoot
the ones removed by removeRoot go to filterFiles

there are two options that are passed to procBackup,
'not on Backup Drive'
separately with 'remove from backup'
 */

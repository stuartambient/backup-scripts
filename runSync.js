const syncs = {
  G: ["G:/G_Music_Backup", "D:/G_Music"],
  F: ["G:/F_Music_Backup", "F:/Music"],
  /* J: ["G:/S_Music_Backup", "J:/S_Music"], */
  D: ["E:/D_Music_Backup", "D:/music"],
  /* I: ["G:/I_Music_Backup", "I:/Music"], */
  H: ["G:/H_Music_Backup", "H:/Music"],
  I: ["E:/I_Music_Backup", "I:/music"],
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

// app/main/services/fileService.js

const fs = require('fs/promises');
const fsSync = require('fs'); // 🔥 for existence check
const path = require('path');


// ---------------- MOVE FILE ----------------
async function moveFile(sourcePath, destinationPath) {
  if (!sourcePath || !destinationPath) {
    throw new Error(`Invalid paths: source=${sourcePath}, dest=${destinationPath}`);
  }

  const fileName = path.basename(sourcePath);
  const targetPath = path.join(destinationPath, fileName);

  // prevent self-move
  if (sourcePath === targetPath) {
    throw new Error("Source and destination are same");
  }

  // ensure destination exists
  await fs.mkdir(destinationPath, { recursive: true });

  try {
    // fast path (same disk)
    await fs.rename(sourcePath, targetPath);
  } catch (err) {
    // cross-device fallback
    if (err.code === 'EXDEV') {
      await fs.copyFile(sourcePath, targetPath);
      await fs.unlink(sourcePath);
    } else {
      throw err;
    }
  }

  return targetPath;
}


// ---------------- CREATE FOLDER ----------------
async function createFolder(parentPath, name) {
  if (!parentPath || !name) {
    throw new Error(`Invalid params: parent=${parentPath}, name=${name}`);
  }

  const folderPath = path.join(parentPath, name);

  // 🔥 prevent overwrite
  if (fsSync.existsSync(folderPath)) {
    throw new Error("Folder already exists");
  }

  await fs.mkdir(folderPath);

  return folderPath;
}


// ---------------- DELETE ----------------
async function deletePath(targetPath) {
  if (!targetPath) {
    throw new Error("Invalid delete path");
  }

  await fs.rm(targetPath, { recursive: true, force: true });
}

async function copyPath(sourcePath, destinationPath) {
  const path = require('path');
  const fs = require('fs/promises');

  const name = path.basename(sourcePath);
  const target = path.join(destinationPath, name);

  await fs.cp(sourcePath, target, { recursive: true });

  return target;
}


// ---------------- EXPORT ----------------
module.exports = {
  moveFile,
  createFolder,
  deletePath,
  copyPath
};
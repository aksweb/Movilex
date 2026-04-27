// app/main/services/fileService.js
const fs = require('fs/promises');
const path = require('path');

async function moveFile(sourcePath, destinationPath) {
  if (!sourcePath || !destinationPath) {
    throw new Error(`Invalid paths: source=${sourcePath}, dest=${destinationPath}`);
  }

  const fileName = path.basename(sourcePath);
  const targetPath = path.join(destinationPath, fileName);

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

module.exports = { moveFile };
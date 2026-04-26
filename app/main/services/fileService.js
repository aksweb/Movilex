// app/main/services/fileService.js
const fs = require('fs/promises');
const path = require('path');

async function moveFile(originalPath, category, destRoot) {
    const targetDir = path.join(destRoot, category);
  
    await fs.mkdir(targetDir, { recursive: true });
  
    const fileName = path.basename(originalPath);
    const targetPath = path.join(targetDir, fileName);
  
    await fs.rename(originalPath, targetPath);
  
    return targetPath;
  }

module.exports = { moveFile };
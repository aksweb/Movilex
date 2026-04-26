// treeService.js
const fs = require('fs/promises');
const path = require('path');

async function listDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    return entries.map(entry => ({
      name: entry.name,
      path: path.join(dirPath, entry.name),
      type: entry.isDirectory() ? 'folder' : 'file'
    }));
  } catch (err) {
    return [];
  }
}

module.exports = { listDirectory };
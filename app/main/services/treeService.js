const fs = require('fs');
const path = require('path');

async function listDirectory(dirPath) {
  const entries = await fs.promises.readdir(dirPath);

  const result = await Promise.all(
    entries.map(async (name) => {
      const fullPath = path.join(dirPath, name);

      try {
        const stat = await fs.promises.stat(fullPath);

        return {
          name,
          path: fullPath,
          type: stat.isDirectory() ? 'folder' : 'file',
          size: stat.size,
          modified: stat.mtimeMs
        };
      } catch (err) {
        // 🔥 handle broken symlinks / permission issues
        return {
          name,
          path: fullPath,
          type: 'file',
          size: 0,
          modified: 0
        };
      }
    })
  );

  return result;
}

module.exports = { listDirectory };
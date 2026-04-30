// app/main/services/scanService.js
const fs = require('fs/promises');
const path = require('path');

async function scanDirectory(rootPath) {
  const results = [];
  const queue = [rootPath];

  while (queue.length > 0) {
    const currentPath = queue.shift();

    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        queue.push(fullPath);
      } else {
        try {
          const stat = await fs.stat(fullPath);

          results.push({
            name: entry.name,
            path: fullPath,
            extension: path.extname(entry.name),
            size: stat.size
          });
        } catch {}
      }
    }
  }

  return results;
}

module.exports = scanDirectory;
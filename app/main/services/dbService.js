//dbServices.js
const db = require('../db');

function insertFiles(files, sourceRoot, destRoot) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO files
      (original_path, name, extension, size, created_at, source_root, dest_root)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
  
    const tx = db.transaction((files) => {
      for (const f of files) {
        stmt.run(
          f.path,
          f.name,
          f.extension,
          f.size,
          new Date().toISOString(),
          sourceRoot,
          destRoot
        );
      }
    });
  
    tx(files);
  }


function getFiles(limit = 100, offset = 0) {
  return db.prepare(`
    SELECT * FROM files
    LIMIT ? OFFSET ?
  `).all(limit, offset);
}

function updateFileStatus(id, status, newPath) {
    return db.prepare(`
      UPDATE files
      SET status = ?, original_path = ?
      WHERE id = ?
    `).run(status, newPath, id);
  }
  function clearFiles() {
    db.prepare(`DELETE FROM files`).run();
  }

module.exports = {
  insertFiles,
  getFiles,
  updateFileStatus,
  clearFiles
};
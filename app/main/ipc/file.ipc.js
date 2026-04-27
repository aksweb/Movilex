const { ipcMain, dialog, shell } = require('electron');
const scanDirectory = require('../services/scanService');
const dbService = require('../services/dbService');
const fs = require('fs');

const { moveFile } = require('../services/fileService'); // ✅ FIX
const { listDirectory } = require('../services/treeService');

function registerFileIpc() {

  // ---------------- SELECT SOURCE ----------------
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled) return null;
    return result.filePaths[0];
  });

  // ---------------- SCAN ----------------
  ipcMain.handle('scan-directory', async (_, { sourceRoot, destRoot }) => {
    dbService.clearFiles();

    const files = await scanDirectory(sourceRoot);
    dbService.insertFiles(files, sourceRoot, destRoot);

    return { inserted: files.length };
  });

  // ---------------- SELECT DEST ----------------
  ipcMain.handle('select-dest-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled) return null;
    return result.filePaths[0];
  });

  // ---------------- DB ----------------
  ipcMain.handle('get-files', async () => {
    return dbService.getFiles();
  });

  // ---------------- MOVE FILE ----------------
  ipcMain.handle('move-file', async (_, { sourcePath, destinationPath }) => {
    try {
      console.log("MOVE DEBUG:", { sourcePath, destinationPath }); // 🔥 keep for now

      const result = await moveFile(sourcePath, destinationPath);

      return { success: true, path: result };
    } catch (e) {
      console.error('move-file error:', e);
      return { success: false, error: e.message };
    }
  });

  // ---------------- LIST ----------------
  ipcMain.handle('list-directory', async (_, dirPath) => {
    return await listDirectory(dirPath);
  });

  // ---------------- OPEN ----------------
  ipcMain.handle('open-file', async (_, filePath) => {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------------- READ ----------------
  ipcMain.handle('read-file', async (_, filePath) => {
    try {
      const data = await fs.promises.readFile(filePath);
      return data;
    } catch (err) {
      return null;
    }
  });
}

module.exports = registerFileIpc;
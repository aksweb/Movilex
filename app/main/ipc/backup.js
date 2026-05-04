const { ipcMain, dialog, shell } = require('electron');
const fs = require('fs');

const fileService = require('../services/fileService');
const { listDirectory } = require('../services/treeService');

function registerFileIpc() {

  // ---------------- SELECT FOLDER ----------------
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled) return null;
    return result.filePaths[0];
  });

  // ---------------- LIST DIRECTORY ----------------
  ipcMain.handle('list-directory', async (_, dirPath) => {
    return await listDirectory(dirPath);
  });

  // ---------------- OPEN FILE ----------------
  ipcMain.handle('open-file', async (_, filePath) => {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ---------------- READ FILE ----------------
  ipcMain.handle('read-file', async (_, filePath) => {
    try {
      return await fs.promises.readFile(filePath);
    } catch {
      return null;
    }
  });

  // ---------------- FILE ACTIONS ----------------
  ipcMain.handle('file-action', async (_, payload) => {
    try {
      switch (payload.action) {

        case 'move': {
          const { sourcePath, targetPath } = payload;
          if (!sourcePath || !targetPath) {
            throw new Error("Invalid move params");
          }

          const result = await fileService.moveFile(sourcePath, targetPath);
          return { success: true, path: result };
        }

        case 'create-folder': {
          const { targetPath, name } = payload;
          if (!targetPath || !name) {
            throw new Error("Invalid create-folder params");
          }

          const result = await fileService.createFolder(targetPath, name);
          return { success: true, path: result };
        }

        case 'delete': {
          const { targetPath } = payload;
          if (!targetPath) {
            throw new Error("Invalid delete params");
          }

          await fileService.deletePath(targetPath);
          return { success: true };
        }

        case 'copy': {
          const { sourcePath, targetPath } = payload;
          if (!sourcePath || !targetPath) {
            throw new Error("Invalid copy params");
          }

          const result = await fileService.copyPath(sourcePath, targetPath);
          return { success: true, path: result };
        }

        default:
          throw new Error("Unknown action: " + payload.action);
      }

    } catch (e) {
      console.error("file-action error:", e);
      return { success: false, error: e.message };
    }
  });
}

module.exports = registerFileIpc;
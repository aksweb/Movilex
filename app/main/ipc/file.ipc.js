const { ipcMain, dialog, shell } = require('electron');
const scanDirectory = require('../services/scanService');
const dbService = require('../services/dbService');
const fs = require('fs');

const fileService = require('../services/fileService');
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

  //folder actions
  ipcMain.handle('file-action', async (_, payload) => {
    try {
      switch (payload.action) {
  
        case 'move': {
          const { sourcePath, targetPath } = payload;
  
          if (!sourcePath || !targetPath) {
            throw new Error("Invalid move params");
          }
  
          const result = await fileService.moveFile(
            sourcePath,
            targetPath
          );
  
          return { success: true, path: result };
        }
  
        case 'create-folder': {
          const { targetPath, name } = payload;
  
          if (!targetPath || !name) {
            throw new Error("Invalid create-folder params");
          }
  
          const result = await fileService.createFolder(
            targetPath,
            name
          );
  
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
        
          const result = await fileService.copyPath(
            sourcePath,
            targetPath
          );
        
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

  //folder creation
  ipcMain.handle('prompt-folder-name', async () => {
    const { response, checkboxChecked } = await dialog.showMessageBox({
      type: 'question',
      buttons: ['OK'],
      title: 'Create Folder',
      message: 'Enter folder name in console (temporary)',
    });
  
    // ❌ Electron has no native input dialog
    // so this is just placeholder unless you build UI
  });
}



module.exports = registerFileIpc;
const { ipcMain, dialog } = require('electron');
const scanDirectory = require('../services/scanService');
const dbService = require('../services/dbService');
const fs = require('fs');

const fileService = require('../services/fileService');
const { listDirectory } = require('../services/treeService');
//to directly open files using default app opener.
const { shell } = require('electron');

function registerFileIpc() {
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('scan-directory', async (_, { sourceRoot, destRoot }) => {
    dbService.clearFiles();
  
    const files = await scanDirectory(sourceRoot);
    dbService.insertFiles(files, sourceRoot, destRoot);
  
    return { inserted: files.length };
  });

  ipcMain.handle('select-dest-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
  
    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('get-files', async () => {
    return dbService.getFiles();
  });

  //move files as per category
  ipcMain.handle('move-file', async (_, { id, path, category, destRoot }) => {
    const newPath = await fileService.moveFile(path, category, destRoot);
  
    dbService.updateFileStatus(id, category, newPath);
  
    return { success: true };
  });

  //list directory
  ipcMain.handle('list-directory', async (_, dirPath) => {
    return await listDirectory(dirPath);
  });

  //open using default file opener
  ipcMain.handle('open-file', async (_, filePath) => {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

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